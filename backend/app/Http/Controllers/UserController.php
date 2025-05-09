<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Requests\UserStoreRequest;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Laravel\Sanctum\PersonalAccessToken;

class UserController extends Controller
{
    public function index() {
        $users = User::all();

        return response()->json($users);
    }

    public function show(User $user) {
        return response()->json($user);
    }

    public function store(UserStoreRequest $request) {
        $user = User::create($request->all());

        if($request->role == 'customer') {
            $user->balance()->create([
                'amount' => 0
            ]);
        }
        
        if($request->role == 'admin') {
            $user->is_premium = true;
        }

        return response()->json([
            'user' => $user,
            'message' => 'ثبت نام با موفقیت انجام شد' 
        ]);
    }

    public function courses() {
        $user = auth()->user();

        if($user->courses) {
            return response()->json($user->courses);
        }

        return response()->json(['message' => 'هیچ دوره ای ثبت نشده است.']);
    }
}
