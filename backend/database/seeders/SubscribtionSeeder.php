<?php

namespace Database\Seeders;

use App\Models\Subscribtion;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SubscribtionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Subscribtion::insert([
            ['name' => 'bronze','persian_name' => 'برنزی'],
            ['name' => 'silver','persian_name' => 'نقره ای'],
            ['name' => 'gold','persian_name' => 'طلایی']
        ]);
    }
}
