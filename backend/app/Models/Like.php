<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Request;
use Laravel\Sanctum\PersonalAccessToken;

class Like extends Model
{
    protected $fillable = ['user_id', 'likable_id', 'likable_type'];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function likable() {
        return $this->morphTo();
    }
}
