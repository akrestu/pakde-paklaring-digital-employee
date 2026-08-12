<?php

namespace App\Http\Controllers;

use App\Http\Requests\Paklarings\StorePaklaringRequest;
use App\Http\Requests\Paklarings\UpdatePaklaringRequest;
use App\Models\Employee;
use App\Models\Paklaring;
use App\Models\Site;
use App\Services\PaklaringNumberGenerator;
use App\Services\PaklaringPdfService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PaklaringController extends Controller
{
    /** Selectable page sizes for the index table; "all" shows every row on one page. */
    private const PER_PAGE_OPTIONS = ['15', '50', '100', 'all'];

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Paklaring::class);

        $user = $request->user();

        $perPageParam = $request->input('per_page', '15');

        if (! in_array($perPageParam, self::PER_PAGE_OPTIONS, true)) {
            $perPageParam = '15';
        }

        $perPage = $perPageParam === 'all'
            ? max($this->scopedQuery($request)->count(), 1)
            : (int) $perPageParam;

        $paklarings = $this->scopedQuery($request)
            ->with('site')
            ->latest('signing_tanggal')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('paklarings/index', [
            'paklarings' => $paklarings,
            'sites' => $user->isSuperAdmin() ? Site::orderBy('name')->get(['id', 'name']) : [],
            'filters' => $request->only(['search', 'site_id']),
            'perPage' => $perPageParam,
            'stats' => [
                'thisMonth' => $this->scopedQuery($request)
                    ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
                    ->count(),
                'sites' => $user->isSuperAdmin()
                    ? $this->scopedQuery($request)->distinct('site_id')->count('site_id')
                    : 1,
            ],
        ]);
    }

    /**
     * @return Builder<Paklaring>
     */
    private function scopedQuery(Request $request): Builder
    {
        $user = $request->user();

        return Paklaring::query()
            ->when(! $user->isSuperAdmin(), fn ($query) => $query->where('site_id', $user->site_id))
            ->when($request->filled('site_id') && $user->isSuperAdmin(), fn ($query) => $query->where('site_id', $request->input('site_id')))
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->input('search');
                $query->where(function ($query) use ($search) {
                    $query->where('nama', 'like', "%{$search}%")
                        ->orWhere('nrpp', 'like', "%{$search}%")
                        ->orWhere('no_surat', 'like', "%{$search}%");
                });
            });
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Paklaring::class);

        $user = $request->user();

        return Inertia::render('paklarings/create', [
            'sites' => $user->isSuperAdmin()
                ? Site::where('is_active', true)->orderBy('name')->get()
                : Site::where('id', $user->site_id)->get(),
            'userSite' => $user->isSuperAdmin() ? null : $user->site,
            'alasanPhkOptions' => Paklaring::ALASAN_PHK_OPTIONS,
        ]);
    }

    public function store(StorePaklaringRequest $request, PaklaringNumberGenerator $numberGenerator, PaklaringPdfService $pdfService): RedirectResponse
    {
        $this->authorize('create', Paklaring::class);

        $user = $request->user();
        $data = $request->validated();

        $site = Site::findOrFail((int) ($user->isSuperAdmin() ? $data['site_id'] : $user->site_id));

        $data['site_id'] = $site->id;
        $data['created_by'] = $user->id;
        $data['no_surat'] = $numberGenerator->generate($site, Carbon::parse($data['signing_tanggal']));

        $paklaring = Paklaring::create($data);
        $paklaring->update(['file_path' => $pdfService->generate($paklaring)]);

        Employee::where('site_id', $site->id)->where('nrpp', $paklaring->nrpp)->update(['is_active' => false]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Paklaring berhasil dibuat: '.$paklaring->no_surat]);

        return to_route('paklarings.show', $paklaring);
    }

    public function createBatch(Request $request): Response
    {
        $this->authorize('create', Paklaring::class);

        $user = $request->user();

        $employees = Employee::query()
            ->with('site')
            ->when(! $user->isSuperAdmin(), fn ($query) => $query->where('site_id', $user->site_id))
            ->where('is_active', true)
            ->orderBy('nama')
            ->get();

        return Inertia::render('paklarings/create-batch', [
            'employees' => $employees,
            'sites' => $user->isSuperAdmin() ? Site::orderBy('name')->get(['id', 'name']) : [],
            'alasanPhkOptions' => Paklaring::ALASAN_PHK_OPTIONS,
        ]);
    }

    public function batchStore(Request $request, PaklaringNumberGenerator $numberGenerator, PaklaringPdfService $pdfService): RedirectResponse
    {
        $this->authorize('create', Paklaring::class);

        $user = $request->user();

        $validated = $request->validate([
            'employee_ids' => ['required', 'array', 'min:1'],
            'employee_ids.*' => ['integer'],
            'alasan_phk' => ['required', Rule::in(Paklaring::ALASAN_PHK_OPTIONS)],
            'doe' => ['required', 'date'],
            'remarks' => ['nullable', 'string'],
            'signing_lokasi' => ['required', 'string', 'max:255'],
            'signing_tanggal' => ['required', 'date'],
        ]);

        $employees = Employee::query()
            ->with('site')
            ->when(! $user->isSuperAdmin(), fn ($query) => $query->where('site_id', $user->site_id))
            ->whereIn('id', $validated['employee_ids'])
            ->get();

        $ready = $employees->filter(fn (Employee $employee) => $employee->is_complete_for_paklaring);
        $skipped = $employees->diff($ready);

        $created = DB::transaction(function () use ($ready, $validated, $user, $numberGenerator, $pdfService) {
            $paklarings = collect();

            foreach ($ready as $employee) {
                $site = $employee->site;

                $data = [
                    'site_id' => $site->id,
                    'nrpp' => $employee->nrpp,
                    'nama' => $employee->nama,
                    'tempat_lahir' => $employee->tempat_lahir,
                    'tanggal_lahir' => $employee->tanggal_lahir,
                    'alamat' => $employee->alamat,
                    'project' => $employee->project,
                    'lokasi' => $employee->lokasi,
                    'beginning_classification' => $employee->beginning_classification,
                    'beginning_versatility' => $employee->beginning_versatility,
                    'final_classification' => $employee->classification,
                    'final_versatility' => $employee->versatility,
                    'alasan_phk' => $validated['alasan_phk'],
                    'doh' => $employee->doh,
                    'doe' => $validated['doe'],
                    'remarks' => $validated['remarks'] ?? null,
                    'signing_lokasi' => $validated['signing_lokasi'],
                    'signing_tanggal' => $validated['signing_tanggal'],
                    'created_by' => $user->id,
                ];

                $data['no_surat'] = $numberGenerator->generate($site, Carbon::parse($validated['signing_tanggal']));

                $paklaring = Paklaring::create($data);
                $paklaring->update(['file_path' => $pdfService->generate($paklaring)]);

                $employee->update(['is_active' => false]);

                $paklarings->push($paklaring);
            }

            return $paklarings;
        });

        $message = $created->count() === 1
            ? '1 paklaring berhasil dibuat.'
            : "{$created->count()} paklaring berhasil dibuat.";

        if ($skipped->isNotEmpty()) {
            $message .= ' '.$skipped->count().' dilewati karena data karyawan belum lengkap: '
                .$skipped->pluck('nama')->implode(', ').'.';
        }

        Inertia::flash('toast', [
            'type' => $skipped->isEmpty() ? 'success' : 'error',
            'message' => $message,
        ]);

        return to_route('paklarings.index');
    }

    public function show(Paklaring $paklaring): Response
    {
        $this->authorize('view', $paklaring);

        return Inertia::render('paklarings/show', [
            'paklaring' => $paklaring->load('site'),
            'verificationUrl' => route('verify.show', $paklaring->verification_token),
        ]);
    }

    public function edit(Paklaring $paklaring): Response
    {
        $this->authorize('update', $paklaring);

        return Inertia::render('paklarings/edit', [
            'paklaring' => $paklaring->load('site'),
            'alasanPhkOptions' => Paklaring::ALASAN_PHK_OPTIONS,
        ]);
    }

    public function update(UpdatePaklaringRequest $request, Paklaring $paklaring, PaklaringPdfService $pdfService): RedirectResponse
    {
        $this->authorize('update', $paklaring);

        $paklaring->update($request->validated());
        $paklaring->update(['file_path' => $pdfService->generate($paklaring)]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Paklaring berhasil diperbarui.']);

        return to_route('paklarings.show', $paklaring);
    }

    public function destroy(Paklaring $paklaring, PaklaringNumberGenerator $numberGenerator): RedirectResponse
    {
        $this->authorize('delete', $paklaring);

        $numberGenerator->release($paklaring->site, $paklaring->signing_tanggal, $paklaring->no_surat);

        if ($paklaring->file_path) {
            Storage::disk('local')->delete($paklaring->file_path);
        }

        $paklaring->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Paklaring berhasil dihapus.']);

        return to_route('paklarings.index');
    }

    public function bulkDestroy(Request $request, PaklaringNumberGenerator $numberGenerator): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
        ]);

        $paklarings = $this->scopedQuery($request)
            ->with('site')
            ->whereIn('id', $validated['ids'])
            ->get();

        foreach ($paklarings as $paklaring) {
            $this->authorize('delete', $paklaring);
        }

        if ($paklarings->isEmpty()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Tidak ada paklaring yang bisa dihapus.']);

            return to_route('paklarings.index');
        }

        // Release from the highest sequence number down so consecutive
        // top-of-sequence deletions within the same site/year cascade
        // correctly (see PaklaringNumberGenerator::release()).
        $paklarings
            ->sortByDesc(fn (Paklaring $paklaring) => (int) Str::afterLast($paklaring->no_surat, '-'))
            ->each(function (Paklaring $paklaring) use ($numberGenerator) {
                $numberGenerator->release($paklaring->site, $paklaring->signing_tanggal, $paklaring->no_surat);

                if ($paklaring->file_path) {
                    Storage::disk('local')->delete($paklaring->file_path);
                }
            });

        $count = $paklarings->count();

        Paklaring::whereIn('id', $paklarings->pluck('id'))->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $count === 1
                ? '1 paklaring berhasil dihapus.'
                : "{$count} paklaring berhasil dihapus.",
        ]);

        return to_route('paklarings.index');
    }

    public function pdf(Paklaring $paklaring): StreamedResponse
    {
        $this->authorize('view', $paklaring);

        abort_unless($paklaring->file_path && Storage::disk('local')->exists($paklaring->file_path), 404);

        return Storage::disk('local')->response($paklaring->file_path, $paklaring->no_surat.'.pdf');
    }
}
