<?php

use App\Models\Employee;
use App\Models\Paklaring;
use App\Models\Site;
use App\Models\User;

/**
 * Fase 10: every main page at 390 and 1440, light and dark — no JS errors
 * and no horizontal page scroll (content width).
 */
function seedReviewData(): Paklaring
{
    $site = Site::factory()->create(['name' => 'Site BAU', 'code' => 'BAU']);
    Employee::factory()->for($site, 'site')->count(3)->create();
    Employee::factory()->for($site, 'site')->create(['doh' => null]);
    Paklaring::factory()->for($site, 'site')->count(2)->create();

    return Paklaring::factory()->for($site, 'site')->create(['alasan_phk' => 'Resign']);
}

function reviewPages(Paklaring $paklaring): array
{
    return [
        'dashboard' => '/dashboard',
        'paklarings' => '/paklarings',
        'paklaring-create' => '/paklarings/create',
        'detail' => '/paklarings/'.$paklaring->id,
        'batch' => '/paklarings/create-batch',
        'employees' => '/employees',
        'import' => '/employees/import',
        'sites' => '/sites',
        'users' => '/users',
        'settings' => '/settings/profile',
    ];
}

/*
 * html/body use overflow-x: clip, so scrollWidth alone cannot catch content
 * spilling past the screen. This checks every element instead, skipping
 * anything inside its own horizontal scroll container (tables) and the
 * off-canvas mobile sidebar.
 */
const NO_HORIZONTAL_SCROLL = <<<'JS'
    [...document.querySelectorAll('body *')].every((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.right <= window.innerWidth + 1 || r.left >= window.innerWidth) return true;
        for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
            const o = getComputedStyle(p).overflowX;
            if (o === 'auto' || o === 'scroll') return true;
        }
        return false;
    })
    JS;

test('every main page fits a 390 px phone without horizontal scroll', function (string $mode) {
    $paklaring = seedReviewData();
    $this->actingAs(User::factory()->create(['role' => User::ROLE_SUPER_ADMIN, 'name' => 'Restu Admin']));

    foreach (reviewPages($paklaring) as $name => $url) {
        $page = visit($url)->on()->mobile();
        $page = $mode === 'dark' ? $page->inDarkMode() : $page;

        $page->assertNoJavascriptErrors()
            ->assertScript(NO_HORIZONTAL_SCROLL, true)
            ->screenshot(true, "final-390-{$mode}-{$name}");
    }
})->with(['light', 'dark']);

test('every main page renders at 1440 px without horizontal scroll', function (string $mode) {
    $paklaring = seedReviewData();
    $this->actingAs(User::factory()->create(['role' => User::ROLE_SUPER_ADMIN, 'name' => 'Restu Admin']));

    foreach (reviewPages($paklaring) as $name => $url) {
        $page = visit($url);
        $page = $mode === 'dark' ? $page->inDarkMode() : $page;

        $page->resize(1440, 900)
            ->assertNoJavascriptErrors()
            ->assertScript(NO_HORIZONTAL_SCROLL, true)
            ->screenshot(true, "final-1440-{$mode}-{$name}");
    }
})->with(['light', 'dark']);

test('public verification page fits a phone in both themes', function (string $mode) {
    $paklaring = seedReviewData();

    $page = visit('/verify/'.$paklaring->verification_token)->on()->mobile();
    $page = $mode === 'dark' ? $page->inDarkMode() : $page;

    $page->assertSee('Dokumen Asli')
        ->assertNoJavascriptErrors()
        ->assertScript(NO_HORIZONTAL_SCROLL, true)
        ->screenshot(true, "final-390-{$mode}-verify");
})->with(['light', 'dark']);
