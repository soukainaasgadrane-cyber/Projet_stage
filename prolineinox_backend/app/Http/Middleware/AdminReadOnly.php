<?php

namespace App\Http\Middleware;

use Closure;

class AdminReadOnly
{
    public function handle($request, Closure $next)
    {
        $user = $request->user();
        $isAdmin = $user && ($user->role === 'admin' || (method_exists($user, 'hasRole') && $user->hasRole('admin')));
        $allowedAdminWrite = $request->is('api/admin/*') || $request->is('api/logout');

        if ($isAdmin && ! $request->isMethodSafe() && ! $allowedAdminWrite) {
            return response()->json([
                'message' => 'Admin en lecture seule. Action non autorisee.',
            ], 403);
        }

        return $next($request);
    }
}
