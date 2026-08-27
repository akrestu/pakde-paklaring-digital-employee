<?php

use App\Models\Employee;
use App\Models\Paklaring;
use App\Models\Site;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

function makePaklaringPayload(Site $site, string $noSurat = 'WBK-BAU-HRGA-2025-VIII-0001'): array
{
    return [
        'site_id' => $site->id,
        'no_surat' => $noSurat,
        'nrpp' => '202214889',
        'nama' => 'Doni',
        'tempat_lahir' => 'Tanjung Sakti',
        'tanggal_lahir' => '1985-09-19',
        'alamat' => 'Dusun Desa Senabing, Kab. Lahat',
        'project' => $site->default_project,
        'lokasi' => $site->default_location,
        'beginning_classification' => 'Operator 3',
        'beginning_versatility' => 'Driver DT',
        'final_classification' => 'Operator 3',
        'final_versatility' => 'Driver DT, ADT A60H',
        'alasan_phk' => 'End Contract',
        'doh' => '2022-07-23',
        'doe' => '2025-08-11',
        'signing_lokasi' => 'Lahat',
        'signing_tanggal' => '2025-08-15',
    ];
}

test('site admin can create a paklaring for their own site and a pdf is generated', function () {
    Storage::fake('local');

    $site = Site::factory()->create(['code' => 'BAU']);
    $user = User::factory()->create(['role' => User::ROLE_SITE_ADMIN, 'site_id' => $site->id]);

    $response = $this->actingAs($user)->post(route('paklarings.store'), makePaklaringPayload($site, 'WBK-BAU-HRGA-2025-VIII-0834'));

    $paklaring = Paklaring::sole();

    $response->assertRedirect(route('paklarings.show', $paklaring));
    expect($paklaring->site_id)->toBe($site->id)
        ->and($paklaring->no_surat)->toBe('WBK-BAU-HRGA-2025-VIII-0834')
        ->and($paklaring->file_path)->not->toBeNull();

    Storage::disk('local')->assertExists($paklaring->file_path);
});

test('no_surat is entered manually and must be unique', function () {
    Storage::fake('local');

    $site = Site::factory()->create(['code' => 'BAU']);
    $user = User::factory()->create(['role' => User::ROLE_SITE_ADMIN, 'site_id' => $site->id]);

    $this->actingAs($user)
        ->post(route('paklarings.store'), makePaklaringPayload($site, 'WBK-BAU-HRGA-2025-VIII-0001'))
        ->assertRedirect();

    $this->actingAs($user)
        ->post(route('paklarings.store'), makePaklaringPayload($site, 'WBK-BAU-HRGA-2025-VIII-0001'))
        ->assertSessionHasErrors('no_surat');

    expect(Paklaring::count())->toBe(1);
});

test('site admin cannot view or delete a paklaring belonging to another site', function () {
    Storage::fake('local');

    $siteA = Site::factory()->create();
    $siteB = Site::factory()->create();
    $userA = User::factory()->create(['role' => User::ROLE_SITE_ADMIN, 'site_id' => $siteA->id]);
    $paklaringB = Paklaring::factory()->for($siteB, 'site')->create();

    $this->actingAs($userA)->get(route('paklarings.show', $paklaringB))->assertForbidden();
    $this->actingAs($userA)->delete(route('paklarings.destroy', $paklaringB))->assertForbidden();
});

test('a site admin cannot bulk delete a paklaring belonging to another site', function () {
    Storage::fake('local');

    $siteA = Site::factory()->create();
    $siteB = Site::factory()->create();
    $userA = User::factory()->create(['role' => User::ROLE_SITE_ADMIN, 'site_id' => $siteA->id]);
    $paklaringB = Paklaring::factory()->for($siteB, 'site')->create();

    $this->actingAs($userA)
        ->delete(route('paklarings.bulkDestroy'), ['ids' => [$paklaringB->id]])
        ->assertRedirect(route('paklarings.index'));

    expect(Paklaring::find($paklaringB->id))->not->toBeNull();
});

test('super admin can view paklarings from any site', function () {
    $site = Site::factory()->create();
    $admin = User::factory()->create(['role' => User::ROLE_SUPER_ADMIN, 'site_id' => null]);
    $paklaring = Paklaring::factory()->for($site, 'site')->create();

    $this->actingAs($admin)->get(route('paklarings.show', $paklaring))->assertOk();
});

function batchPayload(array $employeeIds): array
{
    return [
        'employee_ids' => $employeeIds,
        'no_surats' => collect($employeeIds)->mapWithKeys(fn ($id, $i) => [
            $id => sprintf('WBK-BAU-HRGA-2026-I-%04d', $i + 1),
        ])->all(),
        'alasan_phk' => 'Efisiensi',
        'doe' => '2026-01-15',
        'remarks' => null,
        'signing_lokasi' => 'Lahat',
        'signing_tanggal' => '2026-01-20',
    ];
}

test('batch store creates one paklaring per selected employee using the manually entered numbers', function () {
    Storage::fake('local');

    $site = Site::factory()->create(['code' => 'BAU']);
    $user = User::factory()->create(['role' => User::ROLE_SITE_ADMIN, 'site_id' => $site->id]);
    $employees = Employee::factory()->for($site, 'site')->count(3)->create(['is_active' => true]);

    $payload = batchPayload($employees->pluck('id')->all());

    $this->actingAs($user)
        ->post(route('paklarings.batchStore'), $payload)
        ->assertRedirect(route('paklarings.index'));

    expect(Paklaring::count())->toBe(3)
        ->and(Paklaring::pluck('no_surat')->sort()->values()->all())
        ->toBe(collect($payload['no_surats'])->sort()->values()->all())
        ->and(Employee::whereIn('id', $employees->pluck('id'))->where('is_active', true)->count())
        ->toBe(0);
});

test('batch store skips employees with incomplete data instead of failing the whole batch', function () {
    Storage::fake('local');

    $site = Site::factory()->create(['code' => 'BAU']);
    $user = User::factory()->create(['role' => User::ROLE_SITE_ADMIN, 'site_id' => $site->id]);
    $ready = Employee::factory()->for($site, 'site')->create(['is_active' => true]);
    $incomplete = Employee::factory()->for($site, 'site')->create(['is_active' => true, 'doh' => null]);

    $this->actingAs($user)
        ->post(route('paklarings.batchStore'), batchPayload([$ready->id, $incomplete->id]))
        ->assertRedirect(route('paklarings.index'));

    expect(Paklaring::count())->toBe(1)
        ->and(Paklaring::sole()->nrpp)->toBe($ready->nrpp)
        ->and($incomplete->fresh()->is_active)->toBeTrue();
});

test('batch store rejects duplicate manually entered numbers within the same submission', function () {
    Storage::fake('local');

    $site = Site::factory()->create(['code' => 'BAU']);
    $user = User::factory()->create(['role' => User::ROLE_SITE_ADMIN, 'site_id' => $site->id]);
    $employees = Employee::factory()->for($site, 'site')->count(2)->create(['is_active' => true]);

    $payload = batchPayload($employees->pluck('id')->all());
    $payload['no_surats'] = collect($payload['no_surats'])->map(fn () => 'WBK-BAU-HRGA-2026-I-0001')->all();

    $this->actingAs($user)
        ->post(route('paklarings.batchStore'), $payload)
        ->assertSessionHasErrors();

    expect(Paklaring::count())->toBe(0);
});

test('a site admin cannot batch create paklarings for another site\'s employees', function () {
    Storage::fake('local');

    $siteA = Site::factory()->create();
    $siteB = Site::factory()->create();
    $userA = User::factory()->create(['role' => User::ROLE_SITE_ADMIN, 'site_id' => $siteA->id]);
    $employeeB = Employee::factory()->for($siteB, 'site')->create(['is_active' => true]);

    $this->actingAs($userA)
        ->post(route('paklarings.batchStore'), batchPayload([$employeeB->id]))
        ->assertRedirect(route('paklarings.index'));

    expect(Paklaring::count())->toBe(0)
        ->and($employeeB->fresh()->is_active)->toBeTrue();
});

test('the index page reports how many paklarings were created this month, scoped to the user site', function () {
    $siteA = Site::factory()->create();
    $siteB = Site::factory()->create();
    $userA = User::factory()->create(['role' => User::ROLE_SITE_ADMIN, 'site_id' => $siteA->id]);
    Paklaring::factory()->for($siteA, 'site')->create();
    Paklaring::factory()->for($siteB, 'site')->create();

    $this->actingAs($userA)
        ->get(route('paklarings.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('paklarings.data', 1)
            ->where('stats.thisMonth', 1)
        );
});

test('public verification page confirms a valid token and rejects an unknown one', function () {
    $paklaring = Paklaring::factory()->create();

    $this->get(route('verify.show', $paklaring->verification_token))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('valid', true)
            ->where('paklaring.no_surat', $paklaring->no_surat)
        );

    $this->get(route('verify.show', (string) Str::uuid()))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('valid', false));
});
