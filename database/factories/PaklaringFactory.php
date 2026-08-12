<?php

namespace Database\Factories;

use App\Models\Paklaring;
use App\Models\Site;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Paklaring>
 */
class PaklaringFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $site = Site::factory();
        $doh = fake()->dateTimeBetween('-5 years', '-1 years');
        $doe = fake()->dateTimeBetween($doh, 'now');

        return [
            'site_id' => $site,
            'nrpp' => fake()->unique()->numerify('2#######'),
            'no_surat' => fake()->unique()->numerify('WBK-###-HRGA-2025-VIII-####'),
            'nama' => fake()->name(),
            'tempat_lahir' => fake()->city(),
            'tanggal_lahir' => fake()->date(),
            'alamat' => fake()->address(),
            'project' => 'PT. '.fake()->company(),
            'lokasi' => fake()->city(),
            'beginning_classification' => 'Operator 3',
            'final_classification' => 'Operator 3',
            'beginning_versatility' => 'Driver DT',
            'final_versatility' => 'Driver DT',
            'alasan_phk' => 'End Contract',
            'doh' => $doh,
            'doe' => $doe,
            'remarks' => null,
            'signing_lokasi' => fake()->city(),
            'signing_tanggal' => $doe,
        ];
    }
}
