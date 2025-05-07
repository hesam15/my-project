<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoryRequest;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Request as FacadesRequest;
use Laravel\Sanctum\PersonalAccessToken;

class CategoryController extends Controller
{
    protected $user;

    public function __construct() {
        $token = PersonalAccessToken::findToken(FacadesRequest::cookie('auth_token'));
        if($token) {
            $this->user = $token->tokenable;
        }
    }

    public function store(CategoryRequest $request) {
        $category = Category::create([
            'name' => $request->name,
            'user_id' => $this->user->id
        ]);

        return response()->json([
            'message' => 'دسته بندی با موفقیت اضافه شد',
            'category' => $category
        ]);
    }
}
