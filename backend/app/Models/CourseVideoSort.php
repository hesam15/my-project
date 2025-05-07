<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourseVideoSort extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'course_id',
        'video_id',
        'sort_order'
    ];

    public function course() {
        return $this->belongsTo(Course::class);
    }

    public function video() {
        return $this->belongsTo(Video::class);
    }
}
