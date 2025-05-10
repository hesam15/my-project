<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Request;
use Laravel\Sanctum\PersonalAccessToken;

class Course extends Model
{
    protected $fillable = [
        'title',
        'description',
        'thumbnail_path',
        'is_premium',
        'user_id'
    ];

    protected $with = [
        'likes',
        'comments'
    ];

    public function creator() {
        return $this->belongsTo(User::class);
    }

    public function videos() {
        return $this->hasMany(Video::class);
    }

    public function likes() {
        return $this->morphMany(Like::class, 'likable');
    }

    public function is_liked() {
        $token = PersonalAccessToken::findToken(Request::cookie('auth_token'));
        $user = $token->tokenable;

        return $this->likes->contains('user_id', $user->id);
    }

    public function comments() {
        return $this->morphMany(Comment::class, 'commentable');
    }

    public function getSortedVideosAttribute() {
        return $this->videos()
            ->orderBy('sort', 'asc')
            ->get();
    }
}
