<?php

use Morilog\Jalali\Jalalian;

if(!function_exists('getTimeSlots')) { 
    function getTimeSlots($startTime, $endTime, $intervalMinutes, $date) {
        date_default_timezone_set('Asia/Tehran');
    
        $currentDateTime = time();
        $currentDateShamsi = Jalalian::forge($currentDateTime)->format('Y/m/d');
    
        $start = strtotime($startTime);
        $end = strtotime($endTime);
        $slots = [];
        $lastSlots = [];

        if ($currentDateShamsi == $date) {
            while ($start <= $end) {
                $slots[] = date('H:i', $start);
                if ($start <= $currentDateTime) {
                    $lastSlots[] = date('H:i', $start);
                }
                $start += $intervalMinutes * 60;
            }
        } elseif($currentDateShamsi > $date) {
            $slots = [];
        } else {
            while ($start <= $end) {
                $slots[] = date('H:i', $start);
                $start += $intervalMinutes * 60;
            }
        }
        
        $slots = array_diff($slots, $lastSlots);
    
        return [
            'slots' => $slots,
            'lastSlots' => $lastSlots
        ];
    }
}