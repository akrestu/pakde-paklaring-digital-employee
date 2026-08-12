<?php

namespace Database\Factories;

use App\Models\Site;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Site>
 */
class SiteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $code = strtoupper(fake()->unique()->lexify('???'));

        return [
            'code' => $code,
            'name' => fake()->city().' Site',
            'company_name' => 'PT. '.fake()->company(),
            'address' => fake()->address(),
            'default_project' => 'PT. '.$code,
            'default_location' => fake()->city(),
            'signer_name' => fake()->name(),
            'signer_title' => 'Project Manager',
            'is_active' => true,
        ];
    }
}
