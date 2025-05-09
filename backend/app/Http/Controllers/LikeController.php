<?php

namespace App\Http\Controllers;

use App\Models\Like;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\Request as FacadeRequest;

class LikeController extends Controller
{
    protected $user;

    public function __construct() {
        $token = PersonalAccessToken::findToken(FacadeRequest::cookie('auth_token'));
        if($token) {
            $this->user = $token->tokenable;
        }
    }

    public function like(Request $request) {
        $model = $request->likeable_type::find($request->likeable_id);

        if($model->likes->contains('user_id', $this->user->id)) {
            $like = $model->likes()->where('user_id', $this->user->id)->first();

            $like->delete();

            return response()->json([
                'message' => 'لایک با موفقیت حذف شد'
            ], 200);
        }
        
        Like::create([
            'likable_type' => $request->likeable_type,
            'likable_id' => $request->likeable_id,
            'user_id' => $this->user->id
        ]);

        return response()->json([
            'message' => 'لایک با موفقیت انجام شد'
        ], 200);
    }
}
