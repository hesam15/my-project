<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request) {
        $user = User::where('phone', $request->phone)->with('balance')->first();
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
        ])->withCookie('login', true);

        return response()->json([
            'message' => 'ورودی نامعتبر است.'
        ], 400);
    }

    /**
     * Destroy an authenticated session.
     */
    public static function destroy()
    {
        session()->forget('login');

        return response()->json([
            'message' => 'کاربر خارج شد'
        ]);
    }
}
