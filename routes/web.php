<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\PaklaringController;
use App\Http\Controllers\SiteController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VerificationController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route(auth()->check() ? 'dashboard' : 'login');
})->name('home');

Route::get('verify/{token}', [VerificationController::class, 'show'])->name('verify.show');
Route::get('verify/{token}/download', [VerificationController::class, 'download'])->name('verify.download');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('paklarings/create-batch', [PaklaringController::class, 'createBatch'])->name('paklarings.createBatch');
    Route::post('paklarings/batch-store', [PaklaringController::class, 'batchStore'])->name('paklarings.batchStore');
    Route::delete('paklarings/bulk-destroy', [PaklaringController::class, 'bulkDestroy'])->name('paklarings.bulkDestroy');
    Route::resource('paklarings', PaklaringController::class);
    Route::get('paklarings/{paklaring}/pdf', [PaklaringController::class, 'pdf'])->name('paklarings.pdf');

    Route::get('employees/import', [EmployeeController::class, 'importForm'])->name('employees.import.form');
    Route::post('employees/import', [EmployeeController::class, 'import'])->name('employees.import');
    Route::get('employees/template', [EmployeeController::class, 'template'])->name('employees.template');
    Route::get('employees/export', [EmployeeController::class, 'export'])->name('employees.export');
    Route::get('employees/lookup', [EmployeeController::class, 'lookup'])->name('employees.lookup');
    Route::delete('employees/bulk-destroy', [EmployeeController::class, 'bulkDestroy'])->name('employees.bulkDestroy');
    Route::resource('employees', EmployeeController::class)->except(['show']);

    Route::resource('sites', SiteController::class)->except(['show']);
    Route::resource('users', UserController::class)->except(['show']);
});

require __DIR__.'/settings.php';
