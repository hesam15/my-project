<?php

namespace App\Http\Controllers;

use App\Models\Like;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class LikeController extends Controller
{
    public function like(Request $request) {
        $token = PersonalAccessToken::findToken($request->cookie('auth_token'));
        $user = $token->tokenable;

        $model = $request->likeable_type::find($request->likeable_id);

        if($model->likes->contains('user_id', $user->id)) {
            $like = $model->likes()->where('user_id', $user->id)->first();

            $like->delete();

            return response()->json([
                'message' => 'لایک با موفقیت حذف شد'
            ], 200);
        }
        
        Like::create([
            'likable_type' => $request->likeable_type,
            'likable_id' => $request->likeable_id,
            'user_id' => $user->id
        ]);

        return response()->json([
            'message' => 'لایک با موفقیت انجام شد'
        ], 200);
    }
}
