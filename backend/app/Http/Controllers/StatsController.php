<?php

namespace App\Http\Controllers;

use App\Models\Balance;
use App\Models\Post;
use App\Models\User;
use App\Models\Video;
use App\Models\Course;
use App\Models\Comment;
use App\Models\Consultation;
use App\Models\Like;
use Illuminate\Support\Facades\Cache;

class StatsController extends Controller
{
    public function index() {    
        $stats = Cache::remember('all_stats', 3600, function() {
            return [
                'users' => User::count(),
                'videos' => Video::count(),
                'posts' => Post::count(),
                'comments' => Comment::count(),
                'courses' => Course::count(),
                'likes' => Like::count(),
                'balances' => Balance::count(),
                'consultation' => Consultation::count()
            ];
        });

        return response()->json($stats);
    }
}
