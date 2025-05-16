<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
use App\Models\ConsultationReservation;
use Illuminate\Http\Request;

use function Pest\Laravel\json;

class ConsultationController extends Controller
{
    public function index() {
        $consultations = Consultation::all();

        return response()->json($consultations);
    }

    public function show(Consultation $consultation) {
        $consultation = Consultation::with('comments')->findOrFail($consultation->id);

        return response()->json($consultation);
    }

    public function store(Request $request) {
        $consultation = Consultation::create($request->all());

        return response()->json([
            'message' => 'مشاوره با موفقیت ثبت شد',
            'consultation' => $consultation
        ]);
    }

    public function update(Request $request ,Consultation $consultation) {
        $consultation = $consultation->update($request->all());

        return response()->json($consultation);
    }

    public function destroy(Consultation $consultation) {
        $consultation->delete();

        return response()->json([
            'message' => 'حذف مشاوره با موفقیت انجام شد'
        ]);
    }
}
