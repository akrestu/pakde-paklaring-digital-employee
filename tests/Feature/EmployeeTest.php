<?php

use App\Models\Employee;
use App\Models\Site;
use App\Models\User;
use App\Services\EmployeeSpreadsheetService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

/**
 * @param  array<int, array<int, mixed>>  $rows
 */
function makeXlsxUploadedFile(array $rows, string $filename = 'karyawan.xlsx'): UploadedFile
{
    $spreadsheet = new Spreadsheet;
    $spreadsheet->getActiveSheet()->fromArray($rows, null, 'A1');

    $path = tempnam(sys_get_temp_dir(), 'xlsx').'.xlsx';
    (new Xlsx($spreadsheet))->save($path);

    return new UploadedFile($path, $filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', null, true);
}

test('the per_page=all option returns every matching employee on one page', function () {
    $site = Site::factory()->create();
    $user = User::factory()->create(['role' => User::ROLE_SITE_ADMIN, 'site_id' => $site->id]);
    Employee::factory()->for($site, 'site')->count(20)->create();

    $this->actingAs($user)
        ->get(route('employees.index', ['per_page' => 'all']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('employees.data', 20)
            ->where('employees.last_page', 1)
            ->where('perPage', 'all')
        );
});

test('an unrecognized per_page value falls back to the default page size', function () {
    $site = Site::factory()->create();
    $user = User::factory()->create(['role' => User::ROLE_SITE_ADMIN, 'site_id' => $site->id]);
    Employee::factory()->for($site, 'site')->count(20)->create();

    $this->actingAs($user)
        ->get(route('employees.index', ['per_page' => '999999']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('employees.data', 15)
            ->where('perPage', '15')
        );
});

test('site admin can create and only see employees from their own site', function () {
    $siteA = Site::factory()->create();
    $siteB = Site::factory()->create();
    $userA = User::factory()->create(['role' => User::ROLE_SITE_ADMIN, 'site_id' => $siteA->id]);
    Employee::factory()->for($siteA, 'site')->create(['nama' => 'Milik Site A']);
    Employee::factory()->for($siteB, 'site')->create(['nama' => 'Milik Site B']);

    $this->actingAs($userA)
        ->get(route('employees.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('employees.data', 1)
            ->where('employees.data.0.nama', 'Milik Site A')
        );
});

test('employee lookup by nrpp auto-fills fields scoped to the site admin site', function () {
    $site = Site::factory()->create();
    $otherSite = Site::factory()->create();
    $user = User::factory()->create(['role' => User::ROLE_SITE_ADMIN, 'site_id' => $site->id]);

    Employee::factory()->for($site, 'site')->create(['nrpp' => '12345', 'nama' => 'Doni']);
    Employee::factory()->for($otherSite, 'site')->create(['nrpp' => '99999', 'nama' => 'Bukan Punya Site Ini']);

    $this->actingAs($user)
        ->getJson(route('employees.lookup', ['nrpp' => '12345']))
        ->assertOk()
        ->assertJson(['found' => true])
        ->assertJsonPath('employee.nama', 'Doni');

    $this->actingAs($user)
        ->getJson(route('employees.lookup', ['nrpp' => '99999']))
        ->assertOk()
        ->assertJson(['found' => false]);
});

test('importing an xlsx file creates and updates employees by nrpp', function () {
    $site = Site::factory()->create();
    $user = User::factory()->create(['role' => User::ROLE_SITE_ADMIN, 'site_id' => $site->id]);

    Employee::factory()->for($site, 'site')->create(['nrpp' => '111', 'nama' => 'Nama Lama']);

    $file = makeXlsxUploadedFile([
        ['nrpp', 'nama', 'tempat_lahir', 'tanggal_lahir', 'doh'],
        ['111', 'Nama Baru', 'Jakarta', '1990-01-01', '2020-01-01'],
        ['222', 'Karyawan Baru', 'Bandung', '1992-05-05', '2021-06-01'],
    ]);

    $this->actingAs($user)->post(route('employees.import'), ['file' => $file])
        ->assertRedirect(route('employees.import.form'));

    expect(Employee::where('nrpp', '111')->first()->nama)->toBe('Nama Baru')
        ->and(Employee::where('nrpp', '222')->first())->not->toBeNull()
        ->and(Employee::count())->toBe(2);
});

test('super admin importing a file with a site column syncs each row to the matching site', function () {
    $siteA = Site::factory()->create(['code' => 'AAA']);
    $siteB = Site::factory()->create(['code' => 'BBB']);
    $admin = User::factory()->create(['role' => User::ROLE_SUPER_ADMIN, 'site_id' => null]);

    $file = makeXlsxUploadedFile([
        ['nrpp', 'site', 'nama'],
        ['111', 'AAA', 'Karyawan A'],
        ['222', 'bbb', 'Karyawan B'],
    ]);

    $this->actingAs($admin)->post(route('employees.import'), ['file' => $file])
        ->assertRedirect(route('employees.import.form'));

    expect(Employee::where('nrpp', '111')->first()->site_id)->toBe($siteA->id)
        ->and(Employee::where('nrpp', '222')->first()->site_id)->toBe($siteB->id);
});

test('importing a row with an unknown site code is skipped, not imported', function () {
    $admin = User::factory()->create(['role' => User::ROLE_SUPER_ADMIN, 'site_id' => null]);

    $file = makeXlsxUploadedFile([
        ['nrpp', 'site', 'nama'],
        ['111', 'GHOST', 'Karyawan Hantu'],
    ]);

    $this->actingAs($admin)->post(route('employees.import'), ['file' => $file])
        ->assertRedirect(route('employees.import.form'));

    expect(Employee::count())->toBe(0);
});

test('super admin without a default site and a row missing the site column is skipped', function () {
    $admin = User::factory()->create(['role' => User::ROLE_SUPER_ADMIN, 'site_id' => null]);

    $file = makeXlsxUploadedFile([
        ['nrpp', 'nama'],
        ['111', 'Tanpa Site'],
    ]);

    $this->actingAs($admin)->post(route('employees.import'), ['file' => $file])
        ->assertRedirect(route('employees.import.form'));

    expect(Employee::count())->toBe(0);
});

test('site admin cannot use the site column to import into another site', function () {
    $ownSite = Site::factory()->create(['code' => 'OWN']);
    $otherSite = Site::factory()->create(['code' => 'OTH']);
    $user = User::factory()->create(['role' => User::ROLE_SITE_ADMIN, 'site_id' => $ownSite->id]);

    $file = makeXlsxUploadedFile([
        ['nrpp', 'site', 'nama'],
        ['111', 'OTH', 'Karyawan Site Lain'],
        ['222', 'OWN', 'Karyawan Site Sendiri'],
    ]);

    $this->actingAs($user)->post(route('employees.import'), ['file' => $file])
        ->assertRedirect(route('employees.import.form'));

    expect(Employee::where('nrpp', '111')->exists())->toBeFalse()
        ->and(Employee::where('nrpp', '222')->first()->site_id)->toBe($ownSite->id);
});

test('csv files are rejected — only excel is accepted for import', function () {
    $site = Site::factory()->create();
    $user = User::factory()->create(['role' => User::ROLE_SITE_ADMIN, 'site_id' => $site->id]);

    $file = UploadedFile::fake()->createWithContent('karyawan.csv', "nrpp,nama\n111,Test\n");

    $this->actingAs($user)->post(route('employees.import'), ['file' => $file])
        ->assertSessionHasErrors('file');
});

test('the example row in the template is skipped instead of imported as a real employee', function () {
    $site = Site::factory()->create();
    $user = User::factory()->create(['role' => User::ROLE_SITE_ADMIN, 'site_id' => $site->id]);

    $spreadsheet = app(EmployeeSpreadsheetService::class)->template();
    $path = tempnam(sys_get_temp_dir(), 'xlsx').'.xlsx';
    (new Xlsx($spreadsheet))->save($path);
    $file = new UploadedFile($path, 'template.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', null, true);

    $this->actingAs($user)->post(route('employees.import'), ['file' => $file])
        ->assertRedirect(route('employees.import.form'));

    expect(Employee::count())->toBe(0)
        ->and(Employee::where('nrpp', EmployeeSpreadsheetService::EXAMPLE_NRPP)->exists())->toBeFalse();
});

test('template and export endpoints return downloadable xlsx files', function () {
    $site = Site::factory()->create();
    $user = User::factory()->create(['role' => User::ROLE_SITE_ADMIN, 'site_id' => $site->id]);
    Employee::factory()->for($site, 'site')->create(['nama' => 'Untuk Export']);

    $xlsxContentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    $this->actingAs($user)->get(route('employees.template'))
        ->assertOk()
        ->assertHeader('content-type', $xlsxContentType);

    $this->actingAs($user)->get(route('employees.export'))
        ->assertOk()
        ->assertHeader('content-type', $xlsxContentType);
});

test('creating a paklaring marks the matching employee as inactive', function () {
    Storage::fake('local');

    $site = Site::factory()->create();
    $user = User::factory()->create(['role' => User::ROLE_SITE_ADMIN, 'site_id' => $site->id]);
    $employee = Employee::factory()->for($site, 'site')->create(['nrpp' => '555', 'is_active' => true]);

    $this->actingAs($user)->post(route('paklarings.store'), [
        'nrpp' => '555',
        'no_surat' => 'WBK-BAU-HRGA-2025-I-0001',
        'nama' => $employee->nama,
        'tempat_lahir' => 'Jakarta',
        'tanggal_lahir' => '1990-01-01',
        'alamat' => 'Alamat',
        'project' => 'PT. Test',
        'lokasi' => 'Jakarta',
        'beginning_classification' => 'Operator 3',
        'beginning_versatility' => 'Driver DT',
        'final_classification' => 'Operator 3',
        'final_versatility' => 'Driver DT',
        'alasan_phk' => 'End Contract',
        'doh' => '2020-01-01',
        'doe' => '2025-01-01',
        'signing_lokasi' => 'Jakarta',
        'signing_tanggal' => '2025-01-01',
    ])->assertRedirect();

    expect($employee->fresh()->is_active)->toBeFalse();
});

test('bulk delete removes only the selected employees', function () {
    $site = Site::factory()->create();
    $user = User::factory()->create(['role' => User::ROLE_SITE_ADMIN, 'site_id' => $site->id]);
    $toDelete = Employee::factory()->for($site, 'site')->count(2)->create();
    $toKeep = Employee::factory()->for($site, 'site')->create();

    $this->actingAs($user)
        ->delete(route('employees.bulkDestroy'), ['ids' => $toDelete->pluck('id')->all()])
        ->assertRedirect(route('employees.index'));

    expect(Employee::whereIn('id', $toDelete->pluck('id'))->count())->toBe(0)
        ->and(Employee::find($toKeep->id))->not->toBeNull();
});

test('a site admin cannot bulk delete employees belonging to another site', function () {
    $siteA = Site::factory()->create();
    $siteB = Site::factory()->create();
    $userA = User::factory()->create(['role' => User::ROLE_SITE_ADMIN, 'site_id' => $siteA->id]);
    $employeeB = Employee::factory()->for($siteB, 'site')->create();

    $this->actingAs($userA)
        ->delete(route('employees.bulkDestroy'), ['ids' => [$employeeB->id]])
        ->assertRedirect(route('employees.index'));

    expect(Employee::find($employeeB->id))->not->toBeNull();
});

test('employee lookup search matches nrpp or name and stays scoped to the site admin site', function () {
    $site = Site::factory()->create();
    $otherSite = Site::factory()->create();
    $user = User::factory()->create(['role' => User::ROLE_SITE_ADMIN, 'site_id' => $site->id]);

    Employee::factory()->for($site, 'site')->create(['nrpp' => '2305118', 'nama' => 'Budi Santoso']);
    Employee::factory()->for($site, 'site')->create(['nrpp' => '1811207', 'nama' => 'Agus Wibowo']);
    Employee::factory()->for($otherSite, 'site')->create(['nrpp' => '2305999', 'nama' => 'Budi Lain Site']);

    $this->actingAs($user)
        ->getJson(route('employees.lookup', ['q' => 'budi']))
        ->assertOk()
        ->assertJsonCount(1, 'results')
        ->assertJsonPath('results.0.nama', 'Budi Santoso')
        ->assertJsonStructure(['results' => [['nrpp', 'nama', 'is_complete_for_paklaring', 'site' => ['name']]]]);

    $this->actingAs($user)
        ->getJson(route('employees.lookup', ['q' => '2305']))
        ->assertJsonCount(1, 'results')
        ->assertJsonPath('results.0.nrpp', '2305118');
});

test('employee lookup search caps the number of results', function () {
    $admin = User::factory()->create(['role' => User::ROLE_SUPER_ADMIN, 'site_id' => null]);
    Employee::factory()->count(12)->create(['nama' => 'Karyawan Contoh']);

    $this->actingAs($admin)
        ->getJson(route('employees.lookup', ['q' => 'Contoh']))
        ->assertOk()
        ->assertJsonCount(8, 'results');
});

test('the employee list can be filtered by completeness and active status', function () {
    $site = Site::factory()->create();
    $user = User::factory()->create(['role' => User::ROLE_SITE_ADMIN, 'site_id' => $site->id]);

    Employee::factory()->for($site, 'site')->create(['nama' => 'Lengkap Aktif', 'is_active' => true]);
    Employee::factory()->for($site, 'site')->create(['nama' => 'Kurang Aktif', 'is_active' => true, 'doh' => null]);
    Employee::factory()->for($site, 'site')->create(['nama' => 'Kurang Nonaktif', 'is_active' => false, 'alamat' => '']);

    $this->actingAs($user)
        ->get(route('employees.index', ['kelengkapan' => 'belum']))
        ->assertInertia(fn ($page) => $page->has('employees.data', 2)->where('stats.incomplete', 2));

    $this->actingAs($user)
        ->get(route('employees.index', ['kelengkapan' => 'lengkap']))
        ->assertInertia(fn ($page) => $page->has('employees.data', 1)->where('employees.data.0.nama', 'Lengkap Aktif'));

    $this->actingAs($user)
        ->get(route('employees.index', ['kelengkapan' => 'belum', 'status' => 'nonaktif']))
        ->assertInertia(fn ($page) => $page->has('employees.data', 1)->where('employees.data.0.nama', 'Kurang Nonaktif'));
});

test('the completeness scopes agree with the is_complete_for_paklaring accessor', function () {
    Employee::factory()->count(3)->create();
    Employee::factory()->create(['tanggal_lahir' => null]);
    Employee::factory()->create(['versatility' => '']);

    $byAccessor = Employee::all()->filter->is_complete_for_paklaring->pluck('id')->sort()->values()->all();

    expect(Employee::completeForPaklaring()->pluck('id')->sort()->values()->all())->toBe($byAccessor)
        ->and(Employee::incompleteForPaklaring()->count())->toBe(2);
});

test('import preview reports new, updated and skipped rows without saving anything', function () {
    $site = Site::factory()->create(['code' => 'BAU', 'name' => 'Site BAU']);
    $user = User::factory()->create(['role' => User::ROLE_SITE_ADMIN, 'site_id' => $site->id]);
    Employee::factory()->for($site, 'site')->create(['nrpp' => '200', 'nama' => 'Lama']);

    $file = makeXlsxUploadedFile([
        ['nrpp', 'nama'],
        ['100', 'Baru'],
        ['200', 'Diperbarui'],
        ['', 'Tanpa NRPP'],
    ]);

    $this->actingAs($user)
        ->post(route('employees.import.preview'), ['file' => $file])
        ->assertRedirect(route('employees.import.form'))
        ->assertInertiaFlash('importPreview.counts', ['new' => 1, 'update' => 1, 'skip' => 1])
        ->assertInertiaFlash('importPreview.rows.0.status', 'new')
        ->assertInertiaFlash('importPreview.rows.1.status', 'update')
        ->assertInertiaFlash('importPreview.rows.2.message', 'kolom nrpp dan nama wajib diisi.')
        ->assertInertiaFlash('importPreview.rows.0.site', 'Site BAU');

    expect(Employee::count())->toBe(1)
        ->and(Employee::sole()->nama)->toBe('Lama');
});

test('import preview and import agree on every row', function () {
    $site = Site::factory()->create(['code' => 'BAU']);
    $user = User::factory()->create(['role' => User::ROLE_SITE_ADMIN, 'site_id' => $site->id]);
    Employee::factory()->for($site, 'site')->create(['nrpp' => '200']);

    $rows = [
        ['nrpp', 'nama', 'site'],
        ['100', 'Baru', 'BAU'],
        ['200', 'Diperbarui', ''],
        ['300', 'Site Lain', 'XYZ'],
    ];

    $this->actingAs($user)
        ->post(route('employees.import.preview'), ['file' => makeXlsxUploadedFile($rows)])
        ->assertInertiaFlash('importPreview.counts', ['new' => 1, 'update' => 1, 'skip' => 1]);

    $this->actingAs($user)
        ->post(route('employees.import'), ['file' => makeXlsxUploadedFile($rows)])
        ->assertRedirect(route('employees.import.form'))
        ->assertInertiaFlash('importResult.created', 1)
        ->assertInertiaFlash('importResult.updated', 1)
        ->assertInertiaFlash('importResult.skipped', ['Baris 4: kode site "XYZ" tidak ditemukan di aplikasi.']);
});
