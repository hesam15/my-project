<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Request as FacadeRequest;
use App\Models\ConsultationReservation;
use Laravel\Sanctum\PersonalAccessToken;
use App\Http\Requests\ConsultationResevationRequest;

class ConsultationResevationController extends Controller
{
    protected $user;

    public function __construct() {
        $token = PersonalAccessToken::findToken(FacadeRequest::cookie('auth_token'));
        if($token) {
            $this->user = $token->tokenable;
        }
    }


    public function store(ConsultationResevationRequest $request) {        
        $consultationReserve = ConsultationReservation::create([
            'date' => $request->date,
            'time' => $request->time,
            'consultation_id' => $request->consultation_id,
            'user_id' => $this->user->id
        ]);

        return response()->json([
            'message' => 'رزرو با موفقیت انجام شد',
            'consultation_reserve' => $consultationReserve
        ]);
    }

    public function reservedTimes(Request $request) {
        $consultationReserves = ConsultationReservation::where('date', $request->date)->get();
        $times = [];

        if($consultationReserves) {
            foreach($consultationReserves as $consultationReserve) {
                $times[] = $consultationReserve->time;
            }
        }

        return response()->json($times);
    }
}
