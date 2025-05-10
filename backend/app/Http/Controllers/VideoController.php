<?php

namespace App\Http\Controllers;

use App\Models\Video;
use App\Services\FileStorageService;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\VideoStoreRequest;
use App\Http\Requests\VideoUpdateRequest;
use Laravel\Sanctum\PersonalAccessToken;
use App\Services\ThumbnailStorageService;
use Illuminate\Http\Request as HttpRequest;

class VideoController extends Controller
{
    protected $user;

    public function __construct() {
        if(Request::cookie('auth_token')) {
            $token = PersonalAccessToken::findToken(Request::cookie('auth_token'));
            $this->user = $token->tokenable;
        }
    }

    public function index() {
        $videos = Video::all();

        return response()->json($videos);
    }

    public function show(Video $video) {
        return response()->json($video);
    }

    public function store(HttpRequest $request) {
        if($request->course_id && Video::where('course_id', $request->course_id)->where('sort', $request->sort)->first()) {
            courseNewVideoSorting($request->course_id, $request->sort);
        }

        $videoPath = FileStorageService::store($request->file('video_path'), $this->user, 'video');
        $thumbnailPath = ThumbnailStorageService::store($request->file('thumbnail_path'), $this->user, 'video');

        $video = Video::create([
            'title' => $request->title,
            'description' => $request->description,
            'video_path' => $videoPath,
            'course_id' => $request->course_id,
            'is_premium' => boolval($request->is_premium),
            'thumbnail_path' => $thumbnailPath,
            'sort' => $request->sort
        ]);

        return response()->json([
            'message' => 'ویدیو با موفقیت اضافه شد',
            'video' => $video
        ]);
    }

    public function update(VideoUpdateRequest $request, Video $video) {
        $videoPath = FileStorageService::store($request->video_path, $this->user, $video->video_path, 'video');
        $thumbnailPath = ThumbnailStorageService::store($request->thumbnail_path, $this->user, 'video', $video->thumbnail_path);

        $video->update([
            'title' => $request->title,
            'video_path' => $videoPath,
            'course_id' => $request->course_id,
            'is_premium' => boolval($request->is_premium),
            'thumbnail_path' => $thumbnailPath
        ]);

        return response()->json([
            'message' => 'ویدیو با موفقیت بروزرسانی شد',
            'video' => $video
        ]);
    }

    public function destroy(Video $video) {
        Storage::disk('public')->delete($video->video_path);
        Storage::disk('public')->delete($video->thumbnail_path);

        $video->delete();

        return response()->json([
            'message' => 'ویدیو با موفقیت حذف شد'
        ]);
    }
}
