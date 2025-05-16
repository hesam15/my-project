<?php

use App\Models\ConsultationReservation;

if(!function_exists('checkPastReservationTimes')) {
    function checkPastReservationTimes () {
        $reserves = ConsultationReservation::where('status', 'pending')
            ->get();
            
        $nowDate = jdate()->format('Y/m/d');
        $nowHour = jdate()->format('H:m');

        foreach($reserves as $reserve) {
            if($reserve->date < $nowDate || ($reserve->date == $nowDate && $reserve->time < $nowHour)) {
                $reserve->status = 'pasted';
                $reserve->save();
            } 
        }
    }
}