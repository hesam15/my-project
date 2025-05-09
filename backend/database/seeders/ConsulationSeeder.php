<?php

namespace Database\Seeders;

use App\Models\Consultation;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ConsulationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Consultation::create([
            'title' => 'مشاوره مدیریت منابع انسانی',
            'consultant' => 'ممد علی',
            'description' => 'سلام به همه دوستان عزیز',
            'license' => 'دکترای بالینی',
            'consultation_time' => '60',
            'active_times' => '8:00-22:00',
            'thursdays_open' => true
        ]);
    }
}
