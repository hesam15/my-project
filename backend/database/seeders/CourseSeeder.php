<?php

namespace Database\Seeders;

use App\Models\Course;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Course::create([
            'title' => 'دوره شماره 1',
            'description' => 'محتوا',
            'user_id' => 1,
            'is_premium' => 1,
            'thumbnail_path' => 'images/default-course-thumbnail.jpg'
        ]);
    }
}
