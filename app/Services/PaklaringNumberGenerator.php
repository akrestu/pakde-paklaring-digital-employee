<?php

namespace App\Services;

use App\Models\Site;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaklaringNumberGenerator
{
    /**
     * Month numbers (1-12) mapped to their Roman numeral, as used in the
     * letter number (e.g. VIII for August).
     */
    private const ROMAN_MONTHS = [
        1 => 'I', 2 => 'II', 3 => 'III', 4 => 'IV', 5 => 'V', 6 => 'VI',
        7 => 'VII', 8 => 'VIII', 9 => 'IX', 10 => 'X', 11 => 'XI', 12 => 'XII',
    ];

    /**
     * Generate the next letter number for the given site and signing date,
     * atomically incrementing a per-site, per-year counter so concurrent
     * submissions never collide.
     *
     * Format: WBK-{SITE}-HRGA-{YEAR}-{ROMAN_MONTH}-{SEQUENCE:4}
     */
    public function generate(Site $site, CarbonInterface $signingDate): string
    {
        $year = (int) $signingDate->format('Y');

        $sequence = DB::transaction(function () use ($site, $year) {
            $row = DB::table('paklaring_number_sequences')
                ->where('site_id', $site->id)
                ->where('year', $year)
                ->lockForUpdate()
                ->first();

            if ($row === null) {
                DB::table('paklaring_number_sequences')->insert([
                    'site_id' => $site->id,
                    'year' => $year,
                    'last_number' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                return 1;
            }

            $next = $row->last_number + 1;

            DB::table('paklaring_number_sequences')
                ->where('id', $row->id)
                ->update(['last_number' => $next, 'updated_at' => now()]);

            return $next;
        });

        $romanMonth = self::ROMAN_MONTHS[(int) $signingDate->format('n')];
        $sequencePadded = str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);

        return sprintf(
            '%s-%s-%s-%d-%s-%s',
            config('company.code'),
            $site->code,
            config('company.department_code'),
            $year,
            $romanMonth,
            $sequencePadded,
        );
    }

    /**
     * Reclaim a deleted paklaring's number so the next one generated reuses
     * it — but only when it was the most recently issued number for that
     * site/year. Deleting an older/middle number intentionally leaves a gap
     * rather than renumbering everything after it.
     */
    public function release(Site $site, CarbonInterface $signingDate, string $noSurat): void
    {
        $year = (int) $signingDate->format('Y');
        $sequence = (int) Str::afterLast($noSurat, '-');

        DB::transaction(function () use ($site, $year, $sequence) {
            $row = DB::table('paklaring_number_sequences')
                ->where('site_id', $site->id)
                ->where('year', $year)
                ->lockForUpdate()
                ->first();

            if ($row !== null && (int) $row->last_number === $sequence) {
                DB::table('paklaring_number_sequences')
                    ->where('id', $row->id)
                    ->update(['last_number' => max(0, $sequence - 1), 'updated_at' => now()]);
            }
        });
    }
}
