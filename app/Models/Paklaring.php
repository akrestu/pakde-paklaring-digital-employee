<?php

namespace App\Models;

use Database\Factories\PaklaringFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property int $site_id
 * @property string $nrpp
 * @property string $no_surat
 * @property string $nama
 * @property string $tempat_lahir
 * @property Carbon $tanggal_lahir
 * @property string $alamat
 * @property string $project
 * @property string $lokasi
 * @property string $beginning_classification
 * @property string $final_classification
 * @property string $beginning_versatility
 * @property string $final_versatility
 * @property string $alasan_phk
 * @property Carbon $doh
 * @property Carbon $doe
 * @property string|null $remarks
 * @property string $signing_lokasi
 * @property Carbon $signing_tanggal
 * @property string $verification_token
 * @property string|null $file_path
 * @property int|null $created_by
 */
class Paklaring extends Model
{
    /** @use HasFactory<PaklaringFactory> */
    use HasFactory;

    /**
     * Fixed set of termination reasons offered on the paklaring form.
     *
     * @var string[]
     */
    public const ALASAN_PHK_OPTIONS = [
        'End Contract',
        'Resign',
        'Efisiensi',
        'Pensiun',
        'PHK',
    ];

    protected $fillable = [
        'site_id',
        'nrpp',
        'no_surat',
        'nama',
        'tempat_lahir',
        'tanggal_lahir',
        'alamat',
        'project',
        'lokasi',
        'beginning_classification',
        'final_classification',
        'beginning_versatility',
        'final_versatility',
        'alasan_phk',
        'doh',
        'doe',
        'remarks',
        'signing_lokasi',
        'signing_tanggal',
        'file_path',
        'created_by',
    ];

    protected static function booted(): void
    {
        static::creating(function (Paklaring $paklaring): void {
            $paklaring->verification_token ??= (string) Str::uuid();
        });
    }

    protected function casts(): array
    {
        return [
            'tanggal_lahir' => 'date',
            'doh' => 'date',
            'doe' => 'date',
            'signing_tanggal' => 'date',
        ];
    }

    /**
     * @return BelongsTo<Site, $this>
     */
    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
