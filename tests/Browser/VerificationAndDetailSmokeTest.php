<?php

use App\Models\Paklaring;
use App\Models\Site;
use App\Models\User;
use Illuminate\Support\Str;

test('public verification page shows the authentic state without personal data', function () {
    $site = Site::factory()->create(['signer_name' => 'Ir. Penanda Tangan', 'signer_title' => 'HR Manager']);
    $paklaring = Paklaring::factory()->for($site, 'site')->create(['nama' => 'Budi Santoso']);

    visit('/verify/'.$paklaring->verification_token)
        ->on()->mobile()
        ->assertSee('Dokumen Asli')
        ->assertSee('Budi Santoso')
        ->assertSee('Ir. Penanda Tangan · HR Manager')
        ->assertDontSee($paklaring->nrpp)
        ->assertDontSee($paklaring->alasan_phk)
        ->assertNoJavascriptErrors()
        ->screenshot(true, 'verify-found');

    visit('/verify/'.Str::uuid())
        ->on()->mobile()
        ->assertSee('Dokumen tidak ditemukan')
        ->assertNoJavascriptErrors()
        ->screenshot(true, 'verify-missing');
});

test('paklaring detail renders the preview, paper size choice and data groups', function () {
    $paklaring = Paklaring::factory()->create();

    $this->actingAs(User::factory()->create(['role' => User::ROLE_SUPER_ADMIN]));

    visit('/paklarings/'.$paklaring->id)
        ->assertSee($paklaring->no_surat)
        ->assertSee('Salin link verifikasi')
        ->assertSee('QR verifikasi')
        ->assertSee('Penandatanganan')
        ->assertPresent('[aria-label="Ukuran kertas"]')
        ->assertNoJavascriptErrors()
        ->screenshot(true, 'paklaring-detail');
});
