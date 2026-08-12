<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * User account management (creating site_admin accounts, assigning
     * sites) is restricted to the HQ super admin.
     */
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    public function view(User $user, User $model): bool
    {
        return $user->isSuperAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    public function update(User $user, User $model): bool
    {
        return $user->isSuperAdmin();
    }

    public function delete(User $user, User $model): bool
    {
        return $user->isSuperAdmin() && $user->isNot($model);
    }
}
