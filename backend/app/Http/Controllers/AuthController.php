<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Balance;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\UserStoreRequest;
use Illuminate\Support\Facades\Cookie;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    public function register(UserStoreRequest $request) {
        $user = User::create($request->all());

        if($request->role == 'customer') {
            $user->balance()->create([
                'amount' => 0
            ]);
        }
        
        if($request->role == 'admin') {
            $user->is_premium = true;
        }

        $user = $user->find($user->id);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'message' => 'ثبت نام با موفقیت انجام شد' 
        ])->cookie('auth_token', $token, 1440, '/', null, false, true, false, 'None');
    }

    public function login(Request $request)
    {
        if (Auth::attempt($request->only('phone', 'password'))) {
            $user = Auth::user();
    
            if ($request->cookie('auth_token')) {
                cookie()->forget('auth_token');
            }
    
            $token = $user->createToken('auth_token');

    
            return response()->json([
                'user' => $user,
                'message' => 'ورود با موفقیت انجام شد'
                ])->cookie('auth_token', $token->plainTextToken, 1440, '/', null, true, true, false, 'None');
        }
    
        return response()->json([
            'message' => 'شماره تلفن یا رمز عبور اشتباه است'
        ], 401);
    }

    public function logout(Request $request) {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'خروج با موفقیت انجام شد'
        ])->withCookie(cookie()->forget('XSRF-TOKEN'))
            ->withCookie(cookie()->forget('laravel_session'))
            ->withCookie(cookie()->forget('auth_token'));
    }

    public function check(Request $request) {
        $token = PersonalAccessToken::findToken($request->cookie('auth_token'));

        $user = $token->tokenable->load(['consultationReservations' => function($query) {
            $query->orderBy('date', 'asc')
                  ->orderBy('time', 'asc');
        }]);

        return $user ? response()->json(['user' => $user]) : response()->json(['message' => 'کاربر خارج شده است']);
    }
}
