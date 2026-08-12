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
    private const TREND_MONTHS = 6;

    /** How many recent paklarings to show in the activity list. */
    private const RECENT_LIMIT = 6;

    public function index(Request $request): Response
    {
        $user = $request->user();
        $isSuperAdmin = $user->isSuperAdmin();

        $paklaringQuery = fn () => Paklaring::query()
            ->when(! $isSuperAdmin, fn ($query) => $query->where('site_id', $user->site_id));

        $employeeQuery = fn () => Employee::query()
            ->when(! $isSuperAdmin, fn ($query) => $query->where('site_id', $user->site_id));

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
            'employeeStatus' => [
                'active' => $activeEmployees->count(),
                'inactive' => $employeeQuery()->where('is_active', false)->count(),
            ],
            'paklaringBySite' => $isSuperAdmin ? $this->paklaringBySite() : [],
            'recentPaklarings' => $paklaringQuery()
                ->with('site')
                ->latest()
                ->limit(self::RECENT_LIMIT)
                ->get(),
            'site' => $isSuperAdmin ? null : $user->site,
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
     * @return array<int, array{site: string, total: int}>
     */
    private function paklaringBySite(): array
    {
        return Site::query()
            ->withCount('paklarings')
            ->orderByDesc('paklarings_count')
            ->get()
            ->map(fn (Site $site) => ['site' => $site->name, 'total' => $site->paklarings_count])
            ->all();
    }
}
