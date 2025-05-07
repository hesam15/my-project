<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = ['name', 'persian_name'];

    public function posts() {
        return $this->morphedByMany(Post::class, 'categoriable');
    }

    public function videos() {
        return $this->morphedByMany(Video::class, 'categoriable');
    }
}
