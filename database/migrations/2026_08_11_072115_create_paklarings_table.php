<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('paklarings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_id')->constrained()->restrictOnDelete();

            $table->string('nrpp');
            $table->string('no_surat')->unique();

            $table->string('nama');
            $table->string('tempat_lahir');
            $table->date('tanggal_lahir');
            $table->text('alamat');

            $table->string('project');
            $table->string('lokasi');

            $table->string('beginning_classification');
            $table->string('final_classification');
            $table->string('beginning_versatility');
            $table->string('final_versatility');

            $table->string('alasan_phk');
            $table->date('doh');
            $table->date('doe');
            $table->text('remarks')->nullable();

            $table->string('signing_lokasi');
            $table->date('signing_tanggal');

            $table->uuid('verification_token')->unique();
            $table->string('file_path')->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            $table->index(['site_id', 'nrpp']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paklarings');
    }
};
