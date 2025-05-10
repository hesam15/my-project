<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Video;
use App\Models\Course;
use Illuminate\Http\Request;
use App\Models\CourseVideoSort;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\PersonalAccessToken;
use App\Http\Requests\CourseStoreRequest;
use App\Services\ThumbnailStorageService;
use App\Http\Requests\CourseUpdateRequest;
use Illuminate\Support\Facades\Request as FacadeRequest;

class CourseController extends Controller
{
    protected $user;

    public function __construct(User $user) {
        if(FacadeRequest::cookie('auth_token')) {
            $token = PersonalAccessToken::findToken(FacadeRequest::cookie('auth_token'));
            $this->user = $token->tokenable;
        }
    }

    public function index() {
        $courses = Course::all();

        return response()->json($courses);
    }

    public function show(Course $course) {
        $course = Course::with(['sorted_videos'])->findOrFail($course->id);

        return response()->json($course);
    }

    public function store(CourseStoreRequest $request) {
        $thumbnailPath = ThumbnailStorageService::store($request->file('thumbnail_path'), $this->user, 'post');
        
        $course = Course::create([
            'title' => $request->title,
            'description' => $request->description,
            'thumbnail_path' => $thumbnailPath,
            'is_premium' => boolval($request->is_premium),
            'user_id' => $this->user->id,
        ]);

        return response()->json([
            'message' => 'دوره با موفقیت اضافه شد.',
            'course' => $course
        ]);
    }

    public function update(CourseUpdateRequest $request, Course $course) {
        $thumbnailPath = ThumbnailStorageService::store($request->file('thumbnail_path'), $this->user, 'post');

        $course->update([
            'title' => $request->title,
            'description' => $request->description,
            'thumbnail_path' => $thumbnailPath,
            'is_premium' => boolval($request->is_premium),
            'user_id' => $this->user->id            
        ]);

        return response()->json([
            'message' => 'دوره با موفقیت بروزرسانی شد.',
            'course' => $course
        ]);
    }

    public function destroy(Course $course) {
        Storage::disk('public')->delete($course->thumbnail_path);
        $course->delete();

        return response()->json([
            'message' => 'دوره با موفقیت حذف شد'
        ]);
    }

    public function signVideo(Course $course,Video $video  ,Request $request) {
        if($video->where('course_id', $course->id)->where('sort', $request->sort)->exists()) {
            courseVideoSorting($course, $video->sort, $request->sort);
        }

        $video->update([
            'course_id' => $course->id,
            'sort' => $request->sort
        ]);

        return response()->json([
            'message' => 'ترتیب بندی با موفقیت انجام شد'
        ]);
    }
}