<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\ActivityLog;

class LogActivity
{
    public function handle($request, Closure $next)
    {
        $response = $next($request);

        try {
            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => $request->method() . ' ' . $request->path(),
                'model_type' => null,
                'model_id' => null,
                'old_values' => null,
                'new_values' => $request->all(),
                'ip_address' => $request->ip(),
            ]);
        } catch (\Throwable $e) {
            // don't break the request on logging failure
        }

        return $response;
    }
}
