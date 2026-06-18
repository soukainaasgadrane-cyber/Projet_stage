<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\TransactionRequest;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use App\Models\BankAccount;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::with('bankAccount');
        
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        if ($request->has('bank_account_id')) {
            $query->where('bank_account_id', $request->bank_account_id);
        }
        if ($request->has('start_date')) {
            $query->whereDate('transaction_date', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->whereDate('transaction_date', '<=', $request->end_date);
        }
        
        $transactions = $query->orderBy('transaction_date', 'desc')->paginate(20);
        return TransactionResource::collection($transactions);
    }

    public function store(TransactionRequest $request)
    {
        $transaction = Transaction::create($request->validated());
        
        // Mettre à jour le solde du compte bancaire
        if ($request->bank_account_id) {
            $bankAccount = BankAccount::find($request->bank_account_id);
            if ($bankAccount) {
                $newBalance = $bankAccount->current_balance;
                if ($request->type === 'income') {
                    $newBalance += $request->amount;
                } else {
                    $newBalance -= $request->amount;
                }
                $bankAccount->update(['current_balance' => $newBalance]);
            }
        }
        
        return new TransactionResource($transaction);
    }

    public function show(Transaction $transaction)
    {
        $transaction->load('bankAccount');
        return new TransactionResource($transaction);
    }

    public function update(TransactionRequest $request, Transaction $transaction)
    {
        // Annuler l'impact de l'ancienne transaction sur le solde
        if ($transaction->bank_account_id) {
            $oldBank = BankAccount::find($transaction->bank_account_id);
            if ($oldBank) {
                $oldBalance = $oldBank->current_balance;
                if ($transaction->type === 'income') {
                    $oldBank->update(['current_balance' => $oldBalance - $transaction->amount]);
                } else {
                    $oldBank->update(['current_balance' => $oldBalance + $transaction->amount]);
                }
            }
        }
        
        $transaction->update($request->validated());
        
        // Appliquer le nouvel impact
        if ($transaction->bank_account_id) {
            $newBank = BankAccount::find($transaction->bank_account_id);
            if ($newBank) {
                $newBalance = $newBank->current_balance;
                if ($transaction->type === 'income') {
                    $newBank->update(['current_balance' => $newBalance + $transaction->amount]);
                } else {
                    $newBank->update(['current_balance' => $newBalance - $transaction->amount]);
                }
            }
        }
        
        return new TransactionResource($transaction);
    }

    public function destroy(Transaction $transaction)
    {
        // Restaurer le solde bancaire
        if ($transaction->bank_account_id) {
            $bank = BankAccount::find($transaction->bank_account_id);
            if ($bank) {
                if ($transaction->type === 'income') {
                    $bank->update(['current_balance' => $bank->current_balance - $transaction->amount]);
                } else {
                    $bank->update(['current_balance' => $bank->current_balance + $transaction->amount]);
                }
            }
        }
        $transaction->delete();
        return response()->json(['message' => 'Transaction deleted']);
    }
}