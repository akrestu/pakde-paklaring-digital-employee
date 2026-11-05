<?php

namespace App\Models;

use Database\Factories\EmployeeFactory;
use Illuminate\Database\Eloquent\Builder;
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
        return $this->paklaringMissingFields() === [];
    }

    /** Text columns a paklaring needs, mirrored by paklaringMissingFields(). */
    private const PAKLARING_TEXT_FIELDS = [
        'tempat_lahir', 'alamat', 'project', 'lokasi',
        'beginning_classification', 'beginning_versatility', 'classification', 'versatility',
    ];

    /** Date columns a paklaring needs, mirrored by paklaringMissingFields(). */
    private const PAKLARING_DATE_FIELDS = ['tanggal_lahir', 'doh'];

    /**
     * Query equivalent of is_complete_for_paklaring (an accessor cannot be
     * filtered in SQL).
     *
     * @param  Builder<Employee>  $query
     */
    public function scopeCompleteForPaklaring(Builder $query): void
    {
        foreach (self::PAKLARING_TEXT_FIELDS as $column) {
            $query->whereNotNull($column)->where($column, '!=', '');
        }

        foreach (self::PAKLARING_DATE_FIELDS as $column) {
            $query->whereNotNull($column);
        }
    }

    /**
     * @param  Builder<Employee>  $query
     */
    public function scopeIncompleteForPaklaring(Builder $query): void
    {
        $query->where(function (Builder $query) {
            foreach (self::PAKLARING_TEXT_FIELDS as $column) {
                $query->orWhereNull($column)->orWhere($column, '');
            }

            foreach (self::PAKLARING_DATE_FIELDS as $column) {
                $query->orWhereNull($column);
            }
        });
    }

    /**
     * Human-readable labels of the paklaring fields still empty for this
     * employee, in form order. Empty when the employee is complete.
     *
     * @return list<string>
     */
    public function paklaringMissingFields(): array
    {
        $checks = [
            'tempat lahir' => filled($this->tempat_lahir),
            'tanggal lahir' => $this->tanggal_lahir !== null,
            'alamat' => filled($this->alamat),
            'project' => filled($this->project),
            'lokasi' => filled($this->lokasi),
            'beginning classification' => filled($this->beginning_classification),
            'beginning versatility' => filled($this->beginning_versatility),
            'classification akhir' => filled($this->classification),
            'versatility akhir' => filled($this->versatility),
            'DOH' => $this->doh !== null,
        ];

        return array_keys(array_filter($checks, fn (bool $ok) => ! $ok));
    }

    /**
     * @return BelongsTo<Site, $this>
     */
    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }
}
