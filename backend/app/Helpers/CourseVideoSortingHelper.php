<?php

if(!function_exists('courseVideoSorting')) {
    function courseVideoSorting($course, $videoSort, int $newSort) {         
        if($videoSort > $newSort) {
            $courseVideos = $course->videos()
                ->where('sort', '<', $videoSort)
                ->where('sort', '>=', $newSort)->get();
            
            foreach($courseVideos as $courseVideo) {
                $courseVideo->sort += 1;
                $courseVideo->save();
            }
        } elseif($videoSort < $newSort) {
            $courseVideos = $course->videos()
            ->where('sort', '>', $videoSort)
            ->where('sort', '<', $newSort)->get();

        
            foreach($courseVideos as $courseVideo) {
                $courseVideo->sort -= 1;
                $courseVideo->save();
            }
        }
    }
}