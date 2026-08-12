<?php

namespace App\Policies;

use App\Models\Paklaring;
use App\Models\User;

class PaklaringPolicy
{
    /**
     * Anyone signed in may list paklarings; the index query itself is
     * scoped to the user's site (see PaklaringController::index()).
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Paklaring $paklaring): bool
    {
        return $this->belongsToUsersSite($user, $paklaring);
    }

    /**
     * Site admins create paklarings for their own site; the super admin
     * may create for any site.
     */
    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Paklaring $paklaring): bool
    {
        return $this->belongsToUsersSite($user, $paklaring);
    }

    public function delete(User $user, Paklaring $paklaring): bool
    {
        return $this->belongsToUsersSite($user, $paklaring);
    }

    private function belongsToUsersSite(User $user, Paklaring $paklaring): bool
    {
        return $user->isSuperAdmin() || $user->site_id === $paklaring->site_id;
    }
}
