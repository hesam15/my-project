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
        'likes:user_id,likable_type,likable_id',
        'comments:title,content,user_id,commentable_type,commentable_id',
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
}
