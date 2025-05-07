<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    protected $fillable = [
        'title',
        'content',
        'user_id',
        'commentable_type',
        'commentable_id',
        'active'
    ];

    protected $with = [
        'user:id,name'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function commentable() {
        return $this->morphTo();
    }
}
