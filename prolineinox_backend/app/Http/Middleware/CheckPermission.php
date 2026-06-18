<?php

namespace App\Http\Middleware;

use Closure;

class CheckPermission
{
    public function handle($request, Closure $next, $permission)
    {
        if (!auth()->user() || !auth()->user()->hasPermission($permission)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return $next($request);
    }
}