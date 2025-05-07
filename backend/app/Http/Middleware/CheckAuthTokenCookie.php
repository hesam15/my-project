<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class CheckAuthTokenCookie
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if(!$request->cookie('auth_token') || !PersonalAccessToken::findToken($request->cookie('auth_token'))) {
            // $response = $request->cookie('auth_token') ? Cookie::queue(Cookie::forget('auth_token')) : '';

            return response()->json([
                'message' => 'احراز هویت انجام نشده است'
            ], 401);
        }

        return $next($request);
    }
}
