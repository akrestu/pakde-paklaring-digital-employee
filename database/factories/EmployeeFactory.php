<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\Site;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Employee>
 */
class EmployeeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'site_id' => Site::factory(),
            'nrpp' => fake()->unique()->numerify('2#######'),
            'nama' => fake()->name(),
            'tempat_lahir' => fake()->city(),
            'tanggal_lahir' => fake()->date(),
            'alamat' => fake()->address(),
            'project' => 'PT. '.fake()->company(),
            'lokasi' => fake()->city(),
            'beginning_classification' => 'Operator 3',
            'beginning_versatility' => 'Driver DT',
            'classification' => 'Operator 3',
            'versatility' => 'Driver DT',
            'doh' => fake()->dateTimeBetween('-5 years', '-1 years'),
            'is_active' => true,
        ];
    }
}
