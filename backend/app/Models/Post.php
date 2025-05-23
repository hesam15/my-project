<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    protected $fillable = [
        'title',
        'content',
        'thumbnail_path',
        'is_premium',
        'user_id'
    ];

    protected $with = [
        'likes',
        'comments',
        'categories:name'
    ];

    public function author() {
        return $this->belongsTo(User::class);
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

    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($post) {
            $post->comments()->delete();
        });
    }
}
