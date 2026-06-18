<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChequeRequest;
use App\Http\Resources\ChequeResource;
use App\Models\Cheque;
use Illuminate\Http\Request;

class ChequeController extends Controller
{
    public function index(Request $request)
    {
        $query = Cheque::with('company');
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        $cheques = $query->orderBy('due_date')->paginate(15);
        return ChequeResource::collection($cheques);
    }

    public function store(ChequeRequest $request)
    {
        $cheque = Cheque::create($request->validated());
        return new ChequeResource($cheque);
    }

    public function show(Cheque $cheque)
    {
        $cheque->load('company');
        return new ChequeResource($cheque);
    }

    public function update(ChequeRequest $request, Cheque $cheque)
    {
        $cheque->update($request->validated());
        return new ChequeResource($cheque);
    }

    public function destroy(Cheque $cheque)
    {
        $cheque->delete();
        return response()->json(['message' => 'Cheque deleted']);
    }
    
    // Changer le statut d'un chèque
    public function updateStatus(Request $request, Cheque $cheque)
    {
        $request->validate([
            'status' => 'required|in:pending,deposited,cleared,bounced'
        ]);
        $cheque->update(['status' => $request->status]);
        return new ChequeResource($cheque);
    }
}