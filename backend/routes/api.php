<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\ConsultationResevationController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\ManagementToolController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\StatsController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VideoController;
use App\Models\ConsultationResevation;
use Illuminate\Support\Facades\Route;

Route::get('/reservations/available-times/{consultation}', [ConsultationResevationController::class, 'availableTimes']);

Route::prefix('/courses')->controller(CourseController::class)->group(function() {
    Route::get('/', 'index');
    Route::get('/{course}', 'show');
});

Route::prefix('/videos')->controller(VideoController::class)->group(function() {
    Route::get('/', 'index');
    Route::get('/{video}', 'show');
});

Route::prefix('/posts')->controller(PostController::class)->group(function() {
    Route::get('/', 'index');
    Route::get('/{post}', 'show');
});

Route::prefix('/tools')->controller(ManagementToolController::class)->group(function() {
    Route::get('/', 'index');
    Route::get('/{tool}', 'show');
});

Route::prefix('/consultations')->controller(ConsultationController::class)->group(function() {
    Route::get('/', 'index');
    Route::get('/{consultation}', 'show');
});

Route::middleware('checkTokenCookie')->group(function() {
    Route::get('/users/check', [AuthController::class, 'check']);

    Route::post('/comments/{comment}/status', [CommentController::class, 'changeStatus']);
    Route::apiResource('comments', CommentController::class)->only(['index', 'store', 'update', 'destroy']);

    Route::apiResource('posts', PostController::class)->only(['store', 'update', 'destroy']);

    Route::apiResource('tools', ManagementToolController::class)->only(['store', 'update', 'destroy']);

    Route::apiResource('consultations', ConsultationController::class)->only(['store', 'update', 'destroy']);

    Route::put('/reservations/{reservation}/update-status', [ConsultationResevationController::class, 'updateStatus']);

    Route::apiResource('reservations', ConsultationResevationController::class);

    Route::post('/like', [LikeController::class, 'like']);

    Route::middleware('admin')->group(function() {
        Route::get('/getAll', [StatsController::class, 'index']);

        Route::apiResource('/users', UserController::class);

        Route::post('/courses/{course}/videos/{video}/signVideo', [CourseController::class, 'signVideo']);
        Route::apiResource('courses', CourseController::class)->only(['store', 'update', 'destroy']);

        Route::apiResource('videos', VideoController::class)->only(['store', 'update', 'destroy']);
    });
});

require __DIR__.'/auth.php';