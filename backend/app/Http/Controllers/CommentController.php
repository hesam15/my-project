<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use App\Http\Requests\CommentStoreRequest;
use Illuminate\Support\Facades\Request as FacadesRequest;

class CommentController extends Controller
{
    protected $user;

    public function __construct() {
        $token = PersonalAccessToken::findToken(FacadesRequest::cookie('auth_token'));
        $this->user = $token->tokenable;
    }

    public function index() {
        $comments = Comment::all();

        return response()->json($comments);
    }

    public function store(CommentStoreRequest $request) {
        $comment = Comment::create([
            'title' => $request->title,
            'content' => $request->content,
            'commentable_type' => $request->commentable_type,
            'commentable_id' => $request->commentable_id,
            'user_id' => $this->user->id
        ]);

        return response()->json([
            'message' => 'کامنت با موفقیت ایجاد شد',
            'comments' => $comment
        ]);
    }

    public function changeStatus(Request $request ,Comment $comment) {
        $comment->active = $request->status;
        $comment->save();

        return response()->json([
            'message' => 'تغییر وضعیت با موفقیت انجام شد'
        ]);
    }

    public function destroy(Comment $comment) {
        $comment->delete();

        return response()->json([
            'message' => 'پیام با موفقیت حذف شد'
        ]);
    }
}
