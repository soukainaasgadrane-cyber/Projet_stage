<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReconciliationRequest;
use App\Http\Resources\ReconciliationResource;
use App\Models\Reconciliation;
use App\Models\Transaction;
use Illuminate\Http\Request;

class ReconciliationController extends Controller
{
    public function index()
    {
        $reconciliations = Reconciliation::with('bankAccount')->paginate(15);
        return ReconciliationResource::collection($reconciliations);
    }

    public function store(ReconciliationRequest $request)
    {
        $reconciliation = Reconciliation::create($request->validated());
        return new ReconciliationResource($reconciliation);
    }

    public function show(Reconciliation $reconciliation)
    {
        $reconciliation->load('bankAccount', 'items.transaction');
        return new ReconciliationResource($reconciliation);
    }

    public function update(ReconciliationRequest $request, Reconciliation $reconciliation)
    {
        $reconciliation->update($request->validated());
        return new ReconciliationResource($reconciliation);
    }

    public function destroy(Reconciliation $reconciliation)
    {
        $reconciliation->delete();
        return response()->json(['message' => 'Reconciliation deleted']);
    }
    
    // Ajouter des transactions à la reconciliation
    public function addTransaction(Request $request, Reconciliation $reconciliation)
    {
        $request->validate([
            'transaction_ids' => 'required|array',
            'transaction_ids.*' => 'exists:transactions,id'
        ]);
        
        foreach ($request->transaction_ids as $transactionId) {
            $reconciliation->items()->create([
                'transaction_id' => $transactionId,
                'is_matched' => true
            ]);
        }
        
        return new ReconciliationResource($reconciliation->load('items.transaction'));
    }

    public function autoMatch(Reconciliation $reconciliation)
    {
        $transactions = Transaction::where('bank_account_id', $reconciliation->bank_account_id)
            ->whereBetween('transaction_date', [$reconciliation->start_date, $reconciliation->end_date])
            ->get();

        foreach ($transactions as $transaction) {
            $reconciliation->items()->firstOrCreate(
                ['transaction_id' => $transaction->id],
                ['is_matched' => true]
            );
        }

        return new ReconciliationResource($reconciliation->load('items.transaction'));
    }
}
