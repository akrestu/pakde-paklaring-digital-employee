<?php

use App\Models\Employee;
use App\Models\Site;
use App\Models\User;

test('employee list renders filters, badges and narrows by completeness', function () {
    $site = Site::factory()->create(['name' => 'Site BAU']);
    Employee::factory()->for($site, 'site')->create(['nama' => 'Budi Santoso']);
    Employee::factory()->for($site, 'site')->create(['nama' => 'Joko Susilo', 'doh' => null]);

    $this->actingAs(User::factory()->create(['role' => User::ROLE_SUPER_ADMIN]));

    visit('/employees')
        ->assertSee('Daftar Karyawan')
        ->assertSee('2 aktif · 1 belum lengkap')
        ->assertSee('Belum lengkap')
        ->assertNoJavascriptErrors()
        ->screenshot(true, 'employees-index')
        ->select('[aria-label="Filter kelengkapan"]', 'belum')
        ->assertSee('Joko Susilo')
        ->assertDontSee('Budi Santoso');
});

test('employee form and import page render in the new layout', function () {
    $site = Site::factory()->create(['name' => 'Site BAU']);
    $employee = Employee::factory()->for($site, 'site')->create(['nama' => 'Budi Santoso']);

    $this->actingAs(User::factory()->create(['role' => User::ROLE_SITE_ADMIN, 'site_id' => $site->id]));

    visit('/employees/'.$employee->id.'/edit')
        ->assertSee('Edit Karyawan')
        ->assertSee('Classification & versatility')
        ->assertPresent('[role="switch"][aria-checked="true"]')
        ->assertNoJavascriptErrors()
        ->screenshot(true, 'employee-form');

    visit('/employees/import')
        ->assertSee('Template Excel')
        ->assertSee('Tarik file ke sini atau klik untuk memilih')
        ->assertNoJavascriptErrors()
        ->screenshot(true, 'employee-import');
});
