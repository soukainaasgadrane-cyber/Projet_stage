<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class KernelCheck
{
    public function handle(Request $request, Closure $next)
    {
        // Test simple
        logger('KernelCheck middleware works');

        return $next($request);
    }
}