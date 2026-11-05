<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Paklaring;
use App\Models\Site;
use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /** How many trailing months (including the current one) the trend chart covers. */
    private const TREND_MONTHS = 12;

    /** How many recent paklarings to show in the activity list. */
    private const RECENT_LIMIT = 5;

    public function index(Request $request): Response
    {
        $user = $request->user();
        $isSuperAdmin = $user->isSuperAdmin();

        // Super Admin may narrow the whole dashboard to one site; a Site
        // Admin is always pinned to their own site and cannot override it.
        $siteId = $isSuperAdmin
            ? ($request->integer('site_id') ?: null)
            : $user->site_id;

        if ($isSuperAdmin && $siteId !== null && ! Site::query()->whereKey($siteId)->exists()) {
            $siteId = null;
        }

        $paklaringQuery = fn () => Paklaring::query()
            ->when($siteId !== null, fn ($query) => $query->where('site_id', $siteId));

        $employeeQuery = fn () => Employee::query()
            ->when($siteId !== null, fn ($query) => $query->where('site_id', $siteId));

        $activeEmployees = $employeeQuery()->where('is_active', true)->get();

        return Inertia::render('dashboard', [
            'stats' => [
                'totalPaklaring' => $paklaringQuery()->count(),
                'paklaringThisMonth' => $paklaringQuery()
                    ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
                    ->count(),
                'activeEmployees' => $activeEmployees->count(),
                'incompleteEmployees' => $activeEmployees->reject->is_complete_for_paklaring->count(),
            ],
            'monthlyTrend' => $this->monthlyTrend($paklaringQuery),
            'byReason' => $this->byReason($paklaringQuery),
            'recentPaklarings' => $paklaringQuery()
                ->with('site')
                ->latest()
                ->limit(self::RECENT_LIMIT)
                ->get(),
            'site' => $isSuperAdmin ? null : $user->site,
            'sites' => $isSuperAdmin
                ? Site::query()->orderBy('name')->get(['id', 'code', 'name'])
                : [],
            'filters' => ['site_id' => $isSuperAdmin ? $siteId : null],
            'greeting' => $this->greeting(),
            'today' => $this->todayLabel(),
        ]);
    }

    /**
     * The dashboard greeting/date always reflect Asia/Jakarta wall-clock
     * time regardless of the app's storage timezone (config('app.timezone')
     * is UTC — used for created_at, paklaring numbering, letter dates, etc.
     * and deliberately left alone here). Computed on the server, not with a
     * client-side `new Date()`, so the greeting is identical between SSR and
     * hydration — a browser-computed hour would otherwise disagree with the
     * server-rendered markup and trigger a React hydration mismatch.
     *
     * @return array{text: string, emoji: string}
     */
    private function greeting(): array
    {
        $hour = now('Asia/Jakarta')->hour;

        return match (true) {
            $hour < 5 => ['text' => 'Selamat Malam', 'emoji' => '🌙'],
            $hour < 12 => ['text' => 'Selamat Pagi', 'emoji' => '☀️'],
            $hour < 15 => ['text' => 'Selamat Siang', 'emoji' => '🌤️'],
            $hour < 18 => ['text' => 'Selamat Sore', 'emoji' => '🌅'],
            default => ['text' => 'Selamat Malam', 'emoji' => '🌙'],
        };
    }

    /** Same Asia/Jakarta + SSR/hydration reasoning as {@see greeting()}. */
    private function todayLabel(): string
    {
        $days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        $months = [
            1 => 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
        ];
        $now = now('Asia/Jakarta');

        return sprintf('%s, %d %s %d', $days[$now->dayOfWeek], $now->day, $months[$now->month], $now->year);
    }

    /**
     * @param  Closure(): Builder<Paklaring>  $paklaringQuery
     * @return array<int, array{month: string, total: int}>
     */
    private function monthlyTrend(Closure $paklaringQuery): array
    {
        return collect(range(self::TREND_MONTHS - 1, 0))
            ->map(function (int $monthsAgo) use ($paklaringQuery) {
                $month = now()->subMonthsNoOverflow($monthsAgo);

                return [
                    'month' => $month->copy()->startOfMonth()->toDateString(),
                    'total' => $paklaringQuery()
                        ->whereBetween('created_at', [
                            $month->copy()->startOfMonth(),
                            $month->copy()->endOfMonth(),
                        ])
                        ->count(),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * Paklaring count per termination reason over the same trailing window
     * as the trend chart. Every option is present (zero when unused), sorted
     * by count descending so the horizontal bar chart reads top-down.
     *
     * @param  Closure(): Builder<Paklaring>  $paklaringQuery
     * @return array<int, array{reason: string, total: int}>
     */
    private function byReason(Closure $paklaringQuery): array
    {
        $counts = $paklaringQuery()
            ->where('created_at', '>=', now()->subMonthsNoOverflow(self::TREND_MONTHS - 1)->startOfMonth())
            ->selectRaw('alasan_phk, count(*) as total')
            ->groupBy('alasan_phk')
            ->pluck('total', 'alasan_phk');

        return collect(Paklaring::ALASAN_PHK_OPTIONS)
            ->map(fn (string $reason) => ['reason' => $reason, 'total' => (int) ($counts[$reason] ?? 0)])
            ->sortByDesc('total')
            ->values()
            ->all();
    }
}
