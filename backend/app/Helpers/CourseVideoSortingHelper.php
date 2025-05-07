<?php

if(!function_exists('courseVideoSorting')) {
    function courseVideoSorting($course, $videoSortOrder) {
        $oldCourse = $course->videoSorts()->where('sort_order', $videoSortOrder)->first();
    
        $videoSorts = $course->videoSorts()->orderBy('sort_order', 'asc')->get();
    
        $startIndex = $videoSorts->search(function ($videoSort) use ($oldCourse) {
            return $videoSort->sort_order == $oldCourse->sort_order;
        });
    
        if ($startIndex !== false) {
            $remainingVideoSorts = $videoSorts->slice($startIndex);
        } else {
            $remainingVideoSorts = collect();
        }
    
        foreach($remainingVideoSorts as $videoSort) {
            $newSort = $oldCourse->sort_order += 1;
            $videoSort->sort_order = $newSort;
            $videoSort->save();
        }
    }
}