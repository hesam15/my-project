<?php

use App\Http\Controllers\CommentController;
use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\ManagementToolController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VideoController;
use Illuminate\Support\Facades\Route;

Route::prefix('/courses')->controller(CourseController::class)->group(function() {
    Route::get('/', 'index');
    Route::get('/{course}', 'show');
});

Route::prefix('/posts')->controller(PostController::class)->group(function() {
    Route::get('/', 'index');
    Route::get('/{post}', 'show');
});

Route::prefix('/tools')->controller(ManagementToolController::class)->group(function() {
    Route::get('/', 'index');
    Route::get('/{tool}', 'show');
});

Route::prefix('/consultation')->controller(ConsultationController::class)->group(function() {
    Route::get('/', 'index');
    Route::get('/{tool}', 'show');
});

Route::middleware('checkTokenCookie')->group(function() {
    Route::middleware('admin')->group(function() {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users/create', [UserController::class, 'create']);

        Route::post('/courses/{course}/signVideo', [CourseController::class, 'signVideo']);
        Route::apiResource('courses', CourseController::class)->only(['store', 'update', 'destroy']);

        Route::apiResource('videos', VideoController::class);
    });

    Route::post('/comments/{comment}/status', [CommentController::class, 'changeStatus']);
    Route::apiResource('comments', CommentController::class)->only(['index', 'store', 'update', 'destroy']);

    Route::apiResource('posts', PostController::class)->only(['store', 'update', 'destroy']);

    Route::apiResource('tools', ManagementToolController::class)->only(['store', 'update', 'destroy']);

    Route::apiResource('consultation', ManagementToolController::class)->only(['store', 'update', 'destroy']);

    Route::post('/like', [LikeController::class, 'like']);
});

require __DIR__.'/auth.php';