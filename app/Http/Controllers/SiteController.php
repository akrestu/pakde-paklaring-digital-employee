<?php

namespace App\Http\Controllers;

use App\Http\Requests\Sites\StoreSiteRequest;
use App\Http\Requests\Sites\UpdateSiteRequest;
use App\Models\Site;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SiteController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', Site::class);

        return Inertia::render('sites/index', [
            'sites' => Site::withCount('paklarings')->orderBy('name')->get(),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Site::class);

        return Inertia::render('sites/create');
    }

    public function store(StoreSiteRequest $request): RedirectResponse
    {
        $this->authorize('create', Site::class);

        Site::create([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Site berhasil dibuat.']);

        return to_route('sites.index');
    }

    public function edit(Site $site): Response
    {
        $this->authorize('update', $site);

        return Inertia::render('sites/edit', [
            'site' => $site,
        ]);
    }

    public function update(UpdateSiteRequest $request, Site $site): RedirectResponse
    {
        $this->authorize('update', $site);

        $site->update([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Site berhasil diperbarui.']);

        return to_route('sites.index');
    }

    public function destroy(Site $site): RedirectResponse
    {
        $this->authorize('delete', $site);

        if ($site->paklarings()->exists() || $site->users()->exists()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Site tidak bisa dihapus karena masih memiliki data paklaring atau user.']);

            return to_route('sites.index');
        }

        $site->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Site berhasil dihapus.']);

        return to_route('sites.index');
    }
}
