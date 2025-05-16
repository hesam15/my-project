<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ManagementTool extends Model
{
    protected $table = 'management_tools';

    protected $fillable = [
        'name',
        'description',
        'tool_path',
        'thumbnail_path',
        'is_premium',
        'user_id'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function comments() {
        return $this->morphMany(Comment::class, 'commentable');
    }

    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($tool) {
            $tool->comments()->delete();
        });
    }
}
