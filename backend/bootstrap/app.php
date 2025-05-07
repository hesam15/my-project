<?php

use App\Http\Middleware\AdminChecker;
use Illuminate\Foundation\Application;
use App\Http\Middleware\CheckAuthTokenCookie;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // $middleware->prepend(\Illuminate\Http\Middleware\HandleCors::class);
        // $middleware->prependToGroup('api', [
        //     \Illuminate\Http\Middleware\HandleCors::class,
        //     \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        //     'throttle:api',
        //     \Illuminate\Routing\Middleware\SubstituteBindings::class,
        // ]);

        $middleware->alias([
            'checkTokenCookie' => CheckAuthTokenCookie::class,
            'admin' => AdminChecker::class
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
