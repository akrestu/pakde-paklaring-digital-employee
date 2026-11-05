<?php

use App\Models\Employee;
use App\Models\Paklaring;
use App\Models\Site;
use App\Models\User;

test('paklaring list renders filters, rows and the bulk action bar', function () {
    $site = Site::factory()->create(['name' => 'Site BAU']);
    Paklaring::factory()->count(3)->create(['site_id' => $site->id, 'alasan_phk' => 'Resign']);
    Paklaring::factory()->create(['site_id' => $site->id, 'alasan_phk' => 'PHK']);

    $this->actingAs(User::factory()->create(['role' => User::ROLE_SUPER_ADMIN]));

    visit('/paklarings')
        ->assertSee('Daftar Paklaring')
        ->assertSee('4 surat di semua site')
        ->assertSee('Alasan PHK')
        ->assertSee('Dari tanggal')
        ->assertNoJavascriptErrors()
        ->click('[aria-label="Pilih semua baris"]')
        ->assertSee('4 dipilih')
        ->screenshot(true, 'paklaring-index');
});

test('paklaring form finds an employee through the combobox and fills step one', function () {
    $site = Site::factory()->create(['name' => 'Site BAU']);
    Employee::factory()->for($site, 'site')->create(['nrpp' => '2305118', 'nama' => 'Budi Santoso']);

    $this->actingAs(User::factory()->create(['role' => User::ROLE_SITE_ADMIN, 'site_id' => $site->id]));

    visit('/paklarings/create')
        ->assertSee('Langkah 1 dari 4')
        ->type('[role="combobox"]', 'Budi')
        ->assertSee('NRPP 2305118')
        ->click('[role="option"]')
        ->assertValue('#nama', 'Budi Santoso')
        ->assertNoJavascriptErrors()
        ->screenshot(true, 'paklaring-create');
});
