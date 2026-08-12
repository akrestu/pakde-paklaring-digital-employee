<?php

namespace App\Policies;

use App\Models\Employee;
use App\Models\User;

class EmployeePolicy
{
    /**
     * Anyone signed in may list employees; the index query itself is
     * scoped to the user's site (see EmployeeController::index()).
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Employee $employee): bool
    {
        return $this->belongsToUsersSite($user, $employee);
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Employee $employee): bool
    {
        return $this->belongsToUsersSite($user, $employee);
    }

    public function delete(User $user, Employee $employee): bool
    {
        return $this->belongsToUsersSite($user, $employee);
    }

    private function belongsToUsersSite(User $user, Employee $employee): bool
    {
        return $user->isSuperAdmin() || $user->site_id === $employee->site_id;
    }
}
