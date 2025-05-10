<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Request as FacadeRequest;
use App\Models\ConsultationReservation;
use Laravel\Sanctum\PersonalAccessToken;
use App\Http\Requests\ConsultationResevationRequest;
use App\Models\Consultation;

class ConsultationResevationController extends Controller
{
    protected $user;

    public function __construct() {
        $token = PersonalAccessToken::findToken(FacadeRequest::cookie('auth_token'));
        if($token) {
            $this->user = $token->tokenable;
        }
    }
    
    public function index() {
        $consultationReservations = ConsultationReservation::query()
            ->orderBy('date', 'asc') // مرتب‌سازی بر اساس تاریخ
            ->orderBy('time', 'asc') // مرتب‌سازی بر اساس ساعت
            ->get();
    
        return response()->json($consultationReservations);
    }

    public function show(ConsultationReservation $reservation) {
        return response()->json($reservation);
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

    public function destroy(ConsultationReservation $reservation) {
        $reservation->delete();

        return response()->json([
            'message' => 'حذف رزرو با موفقیت انجام شد'
        ]);
    }

    public function availableTimes(Request $request, Consultation $consultation) {
        $consultationReserves = ConsultationReservation::where('date', $request->query('date'))->where('consultation_id', $consultation->id)->get();
        $reservedTimes = [];

        $consultationTimes = explode('-', $consultation->active_times);

        $times = getTimeSlots($consultationTimes[0], $consultationTimes[1], $consultation->consultation_time, $request->query('date'));

        if($consultationReserves) {
            foreach($consultationReserves as $consultationReserve) {
                $reservedTimes[] = $consultationReserve->time;
            }
        }

        $availabelTimes = array_diff($times['slots'], $reservedTimes);

        return response()->json([
            'lastTimes' => $times['lastSlots'],
            'availabelTimes' => $availabelTimes,
            'reservedTimes' => $reservedTimes
        ]);
    }

    public function updateStatus(Request $request, ConsultationReservation $reservation) {
        $reservation->update([
            'status' => $request->status
        ]);

        return response()->json([
            'message' => 'تغییر وضعیت رزرو با موفقیت انجام شد'
        ]);
    }
}
