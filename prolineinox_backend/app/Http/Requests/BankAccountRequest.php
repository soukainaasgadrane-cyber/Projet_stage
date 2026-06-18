<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BankAccountRequest extends FormRequest
{
    public function authorize() { return true; }
    public function rules()
    {
        return [
            'name' => 'nullable|string|max:255',
            'bank_name' => 'nullable|string|max:255',
            'account_number' => 'required|string|max:50',
            'rib' => 'nullable|string|max:50',
            'balance' => 'nullable|numeric|min:0',
            'initial_balance' => 'nullable|numeric|min:0',
            'current_balance' => 'nullable|numeric',
        ];
    }
}
