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
        'consultation_time',
        'active_times',
        'thursdays_open'
    ];

    public function reserves() {
        return $this->hasMany(ConsultationReservation::class);
    }
}
