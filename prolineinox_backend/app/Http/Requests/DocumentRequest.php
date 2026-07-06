<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DocumentRequest extends FormRequest
{
    public function authorize() { return true; }
    public function rules()
    {
        return [
            'type' => 'required|in:quote,proforma,order,delivery_note,invoice,credit_note,recurring_invoice,purchase_request,purchase_order,receipt_note,supplier_invoice,supplier_credit_note',
            'reference' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('documents', 'reference')->ignore($this->route('document')),
            ],
            'client_reference' => 'required_if:type,quote,proforma,order,delivery_note,invoice,credit_note,recurring_invoice|nullable|string|max:255',
            'company_id' => 'required_if:type,quote,proforma,order,delivery_note,invoice,credit_note,recurring_invoice|nullable|exists:companies,id',
            'contact_id' => 'nullable|exists:contacts,id',
            'responsible_name' => 'nullable|string|max:255',
            'subject' => 'nullable|string|max:255',
            'document_date' => 'required|date',
            'due_date' => 'nullable|date|after_or_equal:document_date',
            'delivery_status' => 'nullable|in:pending,in_progress,delivered,partial',
            'payment_status' => 'nullable|in:unpaid,advance,partial,paid',
            'advance_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:brouillon,validee,acceptee,partielle,livree,expiree,facturee,annulee',
            'items' => 'nullable|array',
            'items.*.article_id' => 'nullable|exists:articles,id',
            'items.*.line_type' => 'nullable|in:article,section',
            'items.*.reference' => 'nullable|string|max:255',
            'items.*.description' => 'required_with:items|string|max:255',
            'items.*.details' => 'nullable|string',
            'items.*.quantity' => 'nullable|numeric|min:0.01',
            'items.*.unit' => 'nullable|string|max:50',
            'items.*.unit_price' => 'nullable|numeric|min:0',
            'items.*.tax_rate' => 'nullable|numeric|min:0|max:100',
        ];
    }
}
