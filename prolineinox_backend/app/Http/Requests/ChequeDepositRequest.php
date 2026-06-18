<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChequeDepositRequest extends FormRequest
{
    public function authorize() { return true; }
    public function rules()
    {
        return [
            'bank_account_id' => 'required|exists:bank_accounts,id',
            'deposit_date' => 'required|date',
            'cheque_ids' => 'required|array',
            'cheque_ids.*' => 'exists:cheques,id'
        ];
    }
}