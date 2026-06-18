<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class AuditController extends Controller
{
    public function index(Request $request)
    {
        $query = ActivityLog::with('user')->orderBy('created_at', 'desc');
        if ($request->filled('user_id')) $query->where('user_id', $request->user_id);
        if ($request->filled('model_type')) $query->where('model_type', $request->model_type);
        return response()->json($query->paginate(50));
    }
}
