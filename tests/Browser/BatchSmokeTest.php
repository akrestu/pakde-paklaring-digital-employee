<?php

use App\Models\Employee;
use App\Models\Paklaring;
use App\Models\Site;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

test('batch flow creates complete employees and lists skipped ones on the result screen', function () {
    Storage::fake('local');

    $site = Site::factory()->create(['name' => 'Site BAU']);
    $ready = Employee::factory()->for($site, 'site')->create(['nama' => 'Budi Santoso', 'is_active' => true]);
    Employee::factory()->for($site, 'site')->create(['nama' => 'Joko Susilo', 'is_active' => true, 'doh' => null]);

    $this->actingAs(User::factory()->create(['role' => User::ROLE_SITE_ADMIN, 'site_id' => $site->id]));

    visit('/paklarings/create-batch')
        ->assertSee('Langkah 1 dari 3')
        ->assertSee('Belum lengkap')
        ->click('[aria-label="Pilih semua"]')
        ->assertSee('2 karyawan dipilih')
        ->click('Lanjut')
        ->assertSee('Isi data')
        ->click('Resign')
        ->type('#doe', '2026-10-31')
        ->type('#signing_lokasi', 'Lahat')
        ->click('Lanjut')
        ->assertSee('Data belum lengkap, akan dilewati')
        ->type('[aria-label="No. surat Budi Santoso"]', 'WBK-BAU-HRGA-2026-XI-0001')
        ->screenshot(true, 'batch-review')
        ->click('Simpan 1 paklaring')
        ->assertSee('Proses selesai')
        ->assertSee('Perlu diperbaiki')
        ->assertSee('DOH belum diisi.')
        ->assertNoJavascriptErrors()
        ->screenshot(true, 'batch-result');

    expect(Paklaring::sole()->nrpp)->toBe($ready->nrpp);
});
