<?php

namespace App\Policies;

use App\Models\Site;
use App\Models\User;

class SitePolicy
{
    /**
     * Only the HQ super admin manages the list of sites.
     */
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    public function view(User $user, Site $site): bool
    {
        return $user->isSuperAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    public function update(User $user, Site $site): bool
    {
        return $user->isSuperAdmin();
    }

    public function delete(User $user, Site $site): bool
    {
        return $user->isSuperAdmin();
    }
}
