<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConsultationReservation extends Model
{
    protected $fillable = [
        'date',
        'time',
        'user_id',
        'consultation_id'
    ];

    protected $whit = [
        'user:id,name',
        'consultation:id,title,consultant'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    } 

    public function consultation() {
        return $this->belongsTo(Consultation::class);
    }
}
