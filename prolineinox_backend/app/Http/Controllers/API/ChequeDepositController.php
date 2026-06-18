<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChequeDepositRequest;
use App\Http\Resources\ChequeDepositResource;
use App\Models\ChequeDeposit;
use App\Models\Cheque;
use Illuminate\Http\Request;

class ChequeDepositController extends Controller
{
    public function index()
    {
        $deposits = ChequeDeposit::with('bankAccount', 'cheques')->paginate(15);
        return ChequeDepositResource::collection($deposits);
    }

    public function store(ChequeDepositRequest $request)
    {
        $total = Cheque::whereIn('id', $request->cheque_ids)->sum('amount');
        
        $deposit = ChequeDeposit::create([
            'bank_account_id' => $request->bank_account_id,
            'deposit_date' => $request->deposit_date,
            'total_amount' => $total,
            'status' => 'pending'
        ]);
        
        $deposit->cheques()->sync($request->cheque_ids);
        
        // Option : changer le statut des chèques en "deposited"
        Cheque::whereIn('id', $request->cheque_ids)->update(['status' => 'deposited']);
        
        return new ChequeDepositResource($deposit->load('cheques'));
    }

    public function show(ChequeDeposit $chequeDeposit)
    {
        $chequeDeposit->load('bankAccount', 'cheques');
        return new ChequeDepositResource($chequeDeposit);
    }

    public function destroy(ChequeDeposit $chequeDeposit)
    {
        $chequeDeposit->cheques()->update(['status' => 'pending']);
        $chequeDeposit->delete();
        return response()->json(['message' => 'Cheque deposit deleted']);
    }
    
    // Valider une remise de chèques (changement de statut)
    public function approve(ChequeDeposit $chequeDeposit)
    {
        $chequeDeposit->update(['status' => 'approved']);
        // On pourrait déclencher l'encaissement effectif sur le compte bancaire
        $bankAccount = $chequeDeposit->bankAccount;
        $newBalance = $bankAccount->current_balance + $chequeDeposit->total_amount;
        $bankAccount->update(['current_balance' => $newBalance]);
        
        // Créer automatiquement une transaction pour cet encaissement
        // (optionnel)
        
        return new ChequeDepositResource($chequeDeposit->load('cheques'));
    }
}