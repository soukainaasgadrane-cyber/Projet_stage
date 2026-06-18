<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChequeRequest extends FormRequest
{
    public function authorize() { return true; }
    public function rules()
    {
        return [
            'cheque_number' => 'required|string|max:50',
            'company_id' => 'required|exists:companies,id',
            'amount' => 'required|numeric|min:0.01',
            'issue_date' => 'required|date',
            'due_date' => 'required|date|after:issue_date',
            'bank_name' => 'nullable|string|max:255',
            'status' => 'nullable|in:pending,deposited,cleared,bounced',
        ];
    }
}