<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PurchaseDocumentRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'reference' => 'nullable|string|max:255',
            'company_id' => 'required|exists:companies,id',
            'contact_id' => 'nullable|exists:contacts,id',
            'document_date' => 'required|date',
            'due_date' => 'nullable|date',
            'subtotal' => 'nullable|numeric',
            'tax' => 'nullable|numeric',
            'discount' => 'nullable|numeric',
            'total' => 'nullable|numeric',
            'delivery_status' => 'nullable|in:pending,in_progress,delivered,partial',
            'payment_status' => 'nullable|in:unpaid,advance,paid',
            'advance_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ];
    }
}
