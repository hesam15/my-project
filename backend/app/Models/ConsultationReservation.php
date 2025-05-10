<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConsultationReservation extends Model
{
    protected $fillable = [
        'date',
        'time',
        'user_id',
        'consultation_id',
        'status'
    ];

    protected $statusLabels = [
        'pending' => 'در انتظار',
        'done' => 'انجام شده',
        'canceled' => 'لغو شده',
    ];

    protected $with = [
        'user:id,name',
        'consultation:id,title,consultant'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    } 

    public function consultation() {
        return $this->belongsTo(Consultation::class);
    }

    public function getStatusLabelAttribute()
    {
        return $this->statusLabels[$this->status] ?? $this->status;
    }

    protected $appends = ['status_label'];

    protected $hidden = ['status'];
}