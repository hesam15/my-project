<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscribtion extends Model
{
    protected $fillable = ['name', 'persian_name'];

    public function customers() {
        return $this->belongsToMany(User::class);
    }
}
