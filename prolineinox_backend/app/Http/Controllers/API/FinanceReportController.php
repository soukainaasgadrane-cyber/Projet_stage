<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\BankAccount;
use App\Models\Document;
use Illuminate\Http\Request;

class FinanceReportController extends Controller
{
    public function treasury(Request $request)
    {
        $from = $request->get('start');
        $to = $request->get('end');

        $query = Transaction::query();
        if ($from && $to) {
            $query->whereBetween('transaction_date', [$from, $to]);
        }

        $incomes = (float) $query->where('type', 'income')->sum('amount');
        $expenses = (float) $query->where('type', 'expense')->sum('amount');
        $balance = $incomes - $expenses;

        return response()->json(["incomes" => $incomes, "expenses" => $expenses, "balance" => $balance]);
    }

    public function overview(Request $request)
    {
        $cash = Transaction::where('payment_method', 'cash')->sum('amount');
        $bank = Transaction::where('payment_method', 'bank_transfer')->sum('amount');
        $cheques = Transaction::where('payment_method', 'cheque')->sum('amount');

        $accounts = BankAccount::all();

        return response()->json([
            'cash' => (float) $cash,
            'bank' => (float) $bank,
            'cheques' => (float) $cheques,
            'accounts' => $accounts,
        ]);
    }

    public function bankHistory(Request $request)
    {
        $accountId = $request->get('bank_account_id');
        $query = Transaction::with('bankAccount')->orderBy('transaction_date', 'desc');
        if ($accountId) $query->where('bank_account_id', $accountId);
        if ($request->filled('start') && $request->filled('end')) {
            $query->whereBetween('transaction_date', [$request->start, $request->end]);
        }
        return response()->json($query->paginate(50));
    }
}
