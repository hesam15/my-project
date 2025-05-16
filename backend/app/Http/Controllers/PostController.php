<?php

namespace App\Http\Controllers;

use App\Http\Requests\PostRequest;
use App\Models\Post;
use App\Services\ThumbnailStorageService;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\PersonalAccessToken;

class PostController extends Controller
{
    protected $user;

    public function __construct() {
        $token = PersonalAccessToken::findToken(Request::cookie('auth_token'));
        if($token) {
            $this->user = $token->tokenable;
        }
    }

    public function index() {
        $posts = Post::all();

        return response()->json($posts);
    }

    public function show(Post $post) {
        $post->views_count += 1;

        return response()->json($post);
    }

    public function store(PostRequest $request) {
        $thumbnailPath = ThumbnailStorageService::store($request->thumbnail_path, $this->user, 'post');

        $post = Post::create([
            'title' => $request->title,
            'content' => $request->content,
            'thumbnail_path' => $thumbnailPath,
            'is_premium' => boolval($request->is_premium),
            'user_id' => $this->user->id
        ]);

        $post->categories()->attach($request->category_id);

        return response([
            'message' => 'مقاله با موفقیت اضافه شد',
            'post' => $post
        ]);
    }

    public function update(PostRequest $request, Post $post) {
        $thumbnailPath = ThumbnailStorageService::store($request->thumbnail_path, $this->user, 'post');

        $post->update([
            'title' => $request->title,
            'content' => $request->content,
            'thumbnail_path' => $thumbnailPath,
            'is_premium' => boolval($request->is_premium),
            'user_id' => $this->user->id
        ]);

        $post->categories()->attach($request->category_id);

        return response([
            'message' => 'مقاله با موفقیت اضافه شد',
            'post' => $post
        ]);
    }

    public function destroy(Post $post) {
        Storage::disk('public')->delete($post->thumbnail_path);

        $post->delete();

        return response()->json([
            'message' => 'پست با موفقیت حذف شد'
        ]);
    }
}
