<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReconciliationRequest extends FormRequest
{
    public function authorize() { return true; }
    public function rules()
    {
        return [
            'bank_account_id' => 'required|exists:bank_accounts,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'statement_balance' => 'required|numeric',
            'system_balance' => 'required|numeric',
        ];
    }
}