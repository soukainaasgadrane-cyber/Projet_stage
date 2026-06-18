<?php

namespace App\Http\Middleware;

use Closure;

class CheckRole
{
    public function handle($request, Closure $next, $role)
    {
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        $user = auth()->user();
        $hasRole = $user->role === $role || (method_exists($user, 'hasRole') && $user->hasRole($role));

        if (!$hasRole) {
            return response()->json(['message' => 'Forbidden - missing role'], 403);
        }
        return $next($request);
    }
}
