<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RecurringSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'document_id' => 'required|exists:documents,id',
            'frequency' => 'required|in:monthly,quarterly,yearly',
            'interval_count' => 'nullable|integer|min:1',
            'next_generation_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:next_generation_date',
            'is_active' => 'nullable|boolean',
        ];
    }
}
