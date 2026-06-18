<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransactionRequest extends FormRequest
{
    public function authorize() { return true; }
    public function rules()
    {
        return [
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0.01',
            'transaction_date' => 'required|date',
            'payment_method' => 'required|string|in:especes,virement,cheque,carte',
            'reference' => 'nullable|string',
            'description' => 'nullable|string',
            'bank_account_id' => 'nullable|exists:bank_accounts,id',
            'transactionable_type' => 'nullable|string',
            'transactionable_id' => 'nullable|integer',
        ];
    }
}