<?php

namespace App\Models;

use Database\Factories\SiteFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $code
 * @property string $name
 * @property string $company_name
 * @property string $address
 * @property string|null $default_project
 * @property string|null $default_location
 * @property string|null $signer_name
 * @property string|null $signer_title
 * @property bool $is_active
 */
class Site extends Model
{
    /** @use HasFactory<SiteFactory> */
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'company_name',
        'address',
        'default_project',
        'default_location',
        'signer_name',
        'signer_title',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return HasMany<User, $this>
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * @return HasMany<Paklaring, $this>
     */
    public function paklarings(): HasMany
    {
        return $this->hasMany(Paklaring::class);
    }

    /**
     * @return HasMany<Employee, $this>
     */
    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }
}
