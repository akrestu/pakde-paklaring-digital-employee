<?php

use App\Models\Employee;
use App\Models\Paklaring;
use App\Models\Site;
use App\Models\User;
use App\Services\PaklaringNumberGenerator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

function makePaklaringPayload(Site $site): array
{
    return [
        'site_id' => $site->id,
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

test('number generator produces sequential numbers per site and resets per year', function () {
    $site = Site::factory()->create(['code' => 'BAU']);
    $generator = app(PaklaringNumberGenerator::class);

    $first = $generator->generate($site, Carbon::parse('2025-08-15'));
    $second = $generator->generate($site, Carbon::parse('2025-08-20'));
    $nextYear = $generator->generate($site, Carbon::parse('2026-01-05'));

    expect($first)->toBe('WBK-BAU-HRGA-2025-VIII-0001')
        ->and($second)->toBe('WBK-BAU-HRGA-2025-VIII-0002')
        ->and($nextYear)->toBe('WBK-BAU-HRGA-2026-I-0001');
});

test('site admin can create a paklaring for their own site and a pdf is generated', function () {
    Storage::fake('local');

    $site = Site::factory()->create(['code' => 'BAU']);
    $user = User::factory()->create(['role' => User::ROLE_SITE_ADMIN, 'site_id' => $site->id]);

    $response = $this->actingAs($user)->post(route('paklarings.store'), makePaklaringPayload($site));

    $paklaring = Paklaring::sole();

    $response->assertRedirect(route('paklarings.show', $paklaring));
    expect($paklaring->site_id)->toBe($site->id)
        ->and($paklaring->no_surat)->toStartWith('WBK-BAU-HRGA-')
        ->and($paklaring->file_path)->not->toBeNull();

    Storage::disk('local')->assertExists($paklaring->file_path);
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

test('deleting the most recently issued paklaring reclaims its number', function () {
    Storage::fake('local');

    $site = Site::factory()->create(['code' => 'BAU']);
    $user = User::factory()->create(['role' => User::ROLE_SITE_ADMIN, 'site_id' => $site->id]);

    $this->actingAs($user)->post(route('paklarings.store'), makePaklaringPayload($site));
    $this->actingAs($user)->post(route('paklarings.store'), makePaklaringPayload($site));
    $this->actingAs($user)->post(route('paklarings.store'), makePaklaringPayload($site));

    $latest = Paklaring::latest('id')->first();
    expect($latest->no_surat)->toEndWith('0003');

    $this->actingAs($user)->delete(route('paklarings.destroy', $latest))->assertRedirect();

    $this->actingAs($user)->post(route('paklarings.store'), makePaklaringPayload($site));
    $newest = Paklaring::latest('id')->first();

    expect($newest->no_surat)->toEndWith('0003')
        ->and($newest->no_surat)->toBe($latest->no_surat);
});

test('deleting a paklaring that is not the latest for its site/year does not reclaim its number', function () {
    Storage::fake('local');

    $site = Site::factory()->create(['code' => 'BAU']);
    $user = User::factory()->create(['role' => User::ROLE_SITE_ADMIN, 'site_id' => $site->id]);

    $this->actingAs($user)->post(route('paklarings.store'), makePaklaringPayload($site));
    $this->actingAs($user)->post(route('paklarings.store'), makePaklaringPayload($site));
    $this->actingAs($user)->post(route('paklarings.store'), makePaklaringPayload($site));

    $middle = Paklaring::orderBy('id')->get()[1];
    expect($middle->no_surat)->toEndWith('0002');

    $this->actingAs($user)->delete(route('paklarings.destroy', $middle))->assertRedirect();

    $this->actingAs($user)->post(route('paklarings.store'), makePaklaringPayload($site));
    $newest = Paklaring::latest('id')->first();

    expect($newest->no_surat)->toEndWith('0004');
});

test('bulk deleting the two most recent paklarings reclaims both numbers', function () {
    Storage::fake('local');

    $site = Site::factory()->create(['code' => 'BAU']);
    $user = User::factory()->create(['role' => User::ROLE_SITE_ADMIN, 'site_id' => $site->id]);

    $this->actingAs($user)->post(route('paklarings.store'), makePaklaringPayload($site));
    $this->actingAs($user)->post(route('paklarings.store'), makePaklaringPayload($site));
    $this->actingAs($user)->post(route('paklarings.store'), makePaklaringPayload($site));

    $toDelete = Paklaring::orderBy('id')->get()->slice(1, 2);
    expect($toDelete->pluck('no_surat')->map(fn ($no) => Str::afterLast($no, '-'))->all())
        ->toBe(['0002', '0003']);

    $this->actingAs($user)
        ->delete(route('paklarings.bulkDestroy'), ['ids' => $toDelete->pluck('id')->all()])
        ->assertRedirect();

    $this->actingAs($user)->post(route('paklarings.store'), makePaklaringPayload($site));
    $this->actingAs($user)->post(route('paklarings.store'), makePaklaringPayload($site));

    expect(Paklaring::pluck('no_surat')->map(fn ($no) => Str::afterLast($no, '-'))->sort()->values()->all())
        ->toBe(['0001', '0002', '0003']);
});

function batchPayload(array $employeeIds): array
{
    return [
        'employee_ids' => $employeeIds,
        'alasan_phk' => 'Efisiensi',
        'doe' => '2026-01-15',
        'remarks' => null,
        'signing_lokasi' => 'Lahat',
        'signing_tanggal' => '2026-01-20',
    ];
}

test('batch store creates one paklaring per selected employee and deactivates them', function () {
    Storage::fake('local');

    $site = Site::factory()->create(['code' => 'BAU']);
    $user = User::factory()->create(['role' => User::ROLE_SITE_ADMIN, 'site_id' => $site->id]);
    $employees = Employee::factory()->for($site, 'site')->count(3)->create(['is_active' => true]);

    $this->actingAs($user)
        ->post(route('paklarings.batchStore'), batchPayload($employees->pluck('id')->all()))
        ->assertRedirect(route('paklarings.index'));

    expect(Paklaring::count())->toBe(3)
        ->and(Paklaring::pluck('no_surat')->map(fn ($no) => Str::afterLast($no, '-'))->sort()->values()->all())
        ->toBe(['0001', '0002', '0003'])
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
