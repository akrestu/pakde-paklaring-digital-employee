<?php

namespace App\Http\Controllers;

use App\Http\Requests\Employees\ImportEmployeesRequest;
use App\Http\Requests\Employees\StoreEmployeeRequest;
use App\Http\Requests\Employees\UpdateEmployeeRequest;
use App\Models\Employee;
use App\Models\Site;
use App\Services\EmployeeImportRow;
use App\Services\EmployeeImportService;
use App\Services\EmployeeSpreadsheetService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EmployeeController extends Controller
{
    /** Selectable page sizes for the index table; "all" shows every row on one page. */
    /** Rows shown on the import preview; the counts always cover the whole file. */
    private const PREVIEW_ROW_LIMIT = 200;

    private const PER_PAGE_OPTIONS = ['15', '50', '100', 'all'];

    public function index(Request $request): InertiaResponse
    {
        $this->authorize('viewAny', Employee::class);

        $user = $request->user();

        $perPageParam = $request->input('per_page', '15');

        if (! in_array($perPageParam, self::PER_PAGE_OPTIONS, true)) {
            $perPageParam = '15';
        }

        $perPage = $perPageParam === 'all'
            ? max($this->scopedQuery($request)->count(), 1)
            : (int) $perPageParam;

        $employees = $this->scopedQuery($request)
            ->orderBy('nama')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('employees/index', [
            'employees' => $employees,
            'sites' => $user->isSuperAdmin() ? Site::orderBy('name')->get(['id', 'name']) : [],
            'filters' => $request->only(['search', 'site_id', 'kelengkapan', 'status']),
            'perPage' => $perPageParam,
            'stats' => [
                'active' => $this->scopedQuery($request)->where('is_active', true)->count(),
                'inactive' => $this->scopedQuery($request)->where('is_active', false)->count(),
                'incomplete' => $this->scopedQuery($request)->incompleteForPaklaring()->count(),
            ],
        ]);
    }

    /**
     * @return Builder<Employee>
     */
    private function scopedQuery(Request $request): Builder
    {
        $user = $request->user();

        return Employee::query()
            ->with('site')
            ->when(! $user->isSuperAdmin(), fn ($query) => $query->where('site_id', $user->site_id))
            ->when($request->filled('site_id') && $user->isSuperAdmin(), fn ($query) => $query->where('site_id', $request->input('site_id')))
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->input('search');
                $query->where(function ($query) use ($search) {
                    $query->where('nama', 'like', "%{$search}%")
                        ->orWhere('nrpp', 'like', "%{$search}%");
                });
            })
            ->when($request->input('kelengkapan') === 'lengkap', fn ($query) => $query->completeForPaklaring())
            ->when($request->input('kelengkapan') === 'belum', fn ($query) => $query->incompleteForPaklaring())
            ->when($request->input('status') === 'aktif', fn ($query) => $query->where('is_active', true))
            ->when($request->input('status') === 'nonaktif', fn ($query) => $query->where('is_active', false));
    }

    public function create(Request $request): InertiaResponse
    {
        $this->authorize('create', Employee::class);

        $user = $request->user();

        return Inertia::render('employees/create', [
            'sites' => $user->isSuperAdmin()
                ? Site::orderBy('name')->get()
                : Site::where('id', $user->site_id)->get(),
            'userSite' => $user->isSuperAdmin() ? null : $user->site,
        ]);
    }

    public function store(StoreEmployeeRequest $request): RedirectResponse
    {
        $this->authorize('create', Employee::class);

        $user = $request->user();
        $data = $request->validated();
        $data['site_id'] = $user->isSuperAdmin() ? $data['site_id'] : $user->site_id;
        $data['is_active'] = $request->boolean('is_active', true);

        Employee::create($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Data karyawan berhasil ditambahkan.']);

        return to_route('employees.index');
    }

    public function edit(Request $request, Employee $employee): InertiaResponse
    {
        $this->authorize('update', $employee);

        $user = $request->user();

        return Inertia::render('employees/edit', [
            'employee' => $employee->load('site'),
            'sites' => $user->isSuperAdmin()
                ? Site::orderBy('name')->get()
                : Site::where('id', $user->site_id)->get(),
        ]);
    }

    public function update(UpdateEmployeeRequest $request, Employee $employee): RedirectResponse
    {
        $this->authorize('update', $employee);

        $user = $request->user();
        $data = $request->validated();
        $data['site_id'] = $user->isSuperAdmin() ? $data['site_id'] : $employee->site_id;

        $employee->update([
            ...$data,
            'is_active' => $request->boolean('is_active'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Data karyawan berhasil diperbarui.']);

        return to_route('employees.index');
    }

    public function destroy(Employee $employee): RedirectResponse
    {
        $this->authorize('delete', $employee);

        $employee->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Data karyawan berhasil dihapus.']);

        return to_route('employees.index');
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
        ]);

        $employees = $this->scopedQuery($request)
            ->whereIn('id', $validated['ids'])
            ->get();

        foreach ($employees as $employee) {
            $this->authorize('delete', $employee);
        }

        if ($employees->isEmpty()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Tidak ada data karyawan yang bisa dihapus.']);

            return to_route('employees.index');
        }

        $count = $employees->count();

        Employee::whereIn('id', $employees->pluck('id'))->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $count === 1
                ? '1 data karyawan berhasil dihapus.'
                : "{$count} data karyawan berhasil dihapus.",
        ]);

        return to_route('employees.index');
    }

    public function importForm(Request $request): InertiaResponse
    {
        $this->authorize('create', Employee::class);

        $user = $request->user();

        return Inertia::render('employees/import', [
            'sites' => $user->isSuperAdmin()
                ? Site::orderBy('name')->get(['id', 'name', 'code'])
                : Site::where('id', $user->site_id)->get(['id', 'name', 'code']),
        ]);
    }

    /**
     * Read the uploaded file and report what an import would do, without
     * saving anything. Uses the exact same row rules as import().
     */
    public function importPreview(ImportEmployeesRequest $request, EmployeeImportService $importService): RedirectResponse
    {
        $this->authorize('create', Employee::class);

        $plan = $importService->plan($request->file('file'), $request->user(), $this->importDefaultSite($request));
        $count = fn (string $status) => count(array_filter($plan, fn (EmployeeImportRow $row) => $row->status === $status));

        Inertia::flash('importPreview', [
            'file_name' => $request->file('file')->getClientOriginalName(),
            'counts' => [
                'new' => $count(EmployeeImportRow::STATUS_NEW),
                'update' => $count(EmployeeImportRow::STATUS_UPDATE),
                'skip' => $count(EmployeeImportRow::STATUS_SKIP),
            ],
            'rows' => array_map(fn (EmployeeImportRow $row) => [
                'row' => $row->rowNumber,
                'nrpp' => $row->attributes['nrpp'] ?? null,
                'nama' => $row->attributes['nama'] ?? null,
                'site' => $row->site?->name,
                'doh' => $row->attributes['doh'] ?? null,
                'status' => $row->status,
                'message' => $row->message,
            ], array_slice($plan, 0, self::PREVIEW_ROW_LIMIT)),
            'truncated' => count($plan) > self::PREVIEW_ROW_LIMIT,
        ]);

        return to_route('employees.import.form');
    }

    public function import(ImportEmployeesRequest $request, EmployeeImportService $importService): RedirectResponse
    {
        $this->authorize('create', Employee::class);

        $result = $importService->import($request->file('file'), $request->user(), $this->importDefaultSite($request));

        // The import page renders its result screen from this flash.
        Inertia::flash('importResult', [
            'created' => $result->created,
            'updated' => $result->updated,
            'skipped' => $result->skipped,
        ]);

        return to_route('employees.import.form');
    }

    private function importDefaultSite(Request $request): ?Site
    {
        $user = $request->user();

        return match (true) {
            $request->filled('site_id') => Site::find((int) $request->input('site_id')),
            ! $user->isSuperAdmin() => $user->site,
            default => null,
        };
    }

    public function template(EmployeeSpreadsheetService $spreadsheetService): StreamedResponse
    {
        $this->authorize('create', Employee::class);

        return $this->streamSpreadsheet($spreadsheetService->template(), 'template-data-karyawan.xlsx');
    }

    public function export(Request $request, EmployeeSpreadsheetService $spreadsheetService): StreamedResponse
    {
        $this->authorize('viewAny', Employee::class);

        $employees = $this->scopedQuery($request)->orderBy('nama')->get();

        return $this->streamSpreadsheet(
            $spreadsheetService->export($employees),
            'data-karyawan-'.now()->format('Y-m-d').'.xlsx',
        );
    }

    private function streamSpreadsheet(Spreadsheet $spreadsheet, string $filename): StreamedResponse
    {
        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    /**
     * Public-to-the-app JSON lookup used by the paklaring form to auto-fill
     * employee fields as soon as an NRPP is typed in.
     */
    public function lookup(Request $request): JsonResponse
    {
        $user = $request->user();

        // Combobox mode: partial match on NRPP or name, a handful of rows,
        // still scoped to the Site Admin's own site.
        if ($request->filled('q')) {
            $term = trim((string) $request->query('q'));

            $results = Employee::query()
                ->with('site:id,name')
                ->where(fn ($query) => $query
                    ->where('nrpp', 'like', "%{$term}%")
                    ->orWhere('nama', 'like', "%{$term}%"))
                ->when(! $user->isSuperAdmin(), fn ($query) => $query->where('site_id', $user->site_id))
                ->when($user->isSuperAdmin() && $request->filled('site_id'), fn ($query) => $query->where('site_id', $request->query('site_id')))
                ->orderByDesc('is_active')
                ->orderBy('nama')
                ->limit(8)
                ->get();

            return response()->json(['results' => $results]);
        }

        $nrpp = (string) $request->query('nrpp');

        $employee = Employee::query()
            ->where('nrpp', $nrpp)
            ->when(! $user->isSuperAdmin(), fn ($query) => $query->where('site_id', $user->site_id))
            ->when($user->isSuperAdmin() && $request->filled('site_id'), fn ($query) => $query->where('site_id', $request->query('site_id')))
            ->first();

        if (! $employee) {
            return response()->json(['found' => false]);
        }

        return response()->json(['found' => true, 'employee' => $employee]);
    }
}
