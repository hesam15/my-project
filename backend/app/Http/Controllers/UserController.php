<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Requests\UserStoreRequest;
use App\Http\Requests\UserUpdateRequest;

class UserController extends Controller
{
    public function index() {
        $users = User::all();

        return response()->json($users);
    }

    public function show(User $user) {
        $user = User::with('consultationReservations')->findOrFail($user->id);

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

    public function destroy(User $user) {
        $user->delete();

        return response()->json([
            'message' => 'حذف کاربر با موفقیت انجام شد.'
        ]);
    }

    public function update(UserUpdateRequest $request, User $user) {
        $user->update($request->all());

        return response()->json([
            'user' => $user,
            'message' => 'ثبت نام با موفقیت انجام شد' 
        ]);
    }

    public function getUser(Request $request) {
        $user = User::where('phone', $request->query('user_phone'))->first();

        return response()->json($user);
    }
}
