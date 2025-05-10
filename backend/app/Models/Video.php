<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Video extends Model
{
    protected $fillable = [
        'title',
        'description',
        'video_path',
        'course_id',
        'thumbnail_path',
        'is_premium',
        'sort'
    ];

    protected $with = [
        'course',
        'likes',
        'comments',
    ];

    public function course() {
        return $this->belongsTo(Course::class);
    }

    public function likes() {
        return $this->morphMany(Like::class, 'likable');
    }

    public function categories() {
        return $this->morphToMany(Category::class, 'categoriable');
    }

    public function comments() {
        return $this->morphMany(Comment::class, 'commentable');
    }
}
