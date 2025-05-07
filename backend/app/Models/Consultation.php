<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Consultation extends Model
{
    protected $fillable = [
        'title',
        'consultant',
        'description',
        'license',
        'time',
        'active_times',
        'thursdays_open'
    ];
}
