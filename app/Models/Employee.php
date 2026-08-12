<?php

namespace App\Models;

use Database\Factories\EmployeeFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $site_id
 * @property string $nrpp
 * @property string $nama
 * @property string|null $tempat_lahir
 * @property Carbon|null $tanggal_lahir
 * @property string|null $alamat
 * @property string|null $project
 * @property string|null $lokasi
 * @property string|null $beginning_classification
 * @property string|null $beginning_versatility
 * @property string|null $classification
 * @property string|null $versatility
 * @property Carbon|null $doh
 * @property bool $is_active
 */
class Employee extends Model
{
    /** @use HasFactory<EmployeeFactory> */
    use HasFactory;

    protected $fillable = [
        'site_id',
        'nrpp',
        'nama',
        'tempat_lahir',
        'tanggal_lahir',
        'alamat',
        'project',
        'lokasi',
        'beginning_classification',
        'beginning_versatility',
        'classification',
        'versatility',
        'doh',
        'is_active',
    ];

    /** @var list<string> */
    protected $appends = ['is_complete_for_paklaring'];

    protected function casts(): array
    {
        return [
            'tanggal_lahir' => 'date',
            'doh' => 'date',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Every field a paklaring requires (see the paklarings table) must be
     * present before this employee can be included in a batch paklaring —
     * unlike the single-create NRPP lookup, batch creation has no manual
     * fallback step to fill in gaps per employee.
     */
    public function getIsCompleteForPaklaringAttribute(): bool
    {
        return filled($this->tempat_lahir)
            && $this->tanggal_lahir !== null
            && filled($this->alamat)
            && filled($this->project)
            && filled($this->lokasi)
            && filled($this->beginning_classification)
            && filled($this->beginning_versatility)
            && filled($this->classification)
            && filled($this->versatility)
            && $this->doh !== null;
    }

    /**
     * @return BelongsTo<Site, $this>
     */
    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }
}
