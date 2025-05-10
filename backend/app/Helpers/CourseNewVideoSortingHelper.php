<?php

use App\Models\Course;

if(!function_exists('courseNewVideoSorting')) {
    function courseNewVideoSorting($course, int $sort) {
        $course = Course::where('id', $course)->first();
        
        $courseVideos = $course->videos()
            ->where('sort', '>=', $sort)->get();
        
        foreach($courseVideos as $courseVideo) {
            $courseVideo->sort += 1;
            $courseVideo->save();
        }
    }
}