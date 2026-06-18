<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ArticleRequest extends FormRequest
{
    public function authorize() { return true; }

    protected function prepareForValidation()
    {
        if ($this->has('price_variants') && is_string($this->price_variants)) {
            $decoded = json_decode($this->price_variants, true);
            $this->merge([
                'price_variants' => json_last_error() === JSON_ERROR_NONE ? $decoded : null,
            ]);
        }
    }

    public function rules()
    {
        return [
            'code' => [
                'required',
                'string',
                Rule::unique('articles', 'code')->ignore($this->route('article')),
            ],
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:4096',
            'category_id' => 'nullable|exists:categories,id',
            'purchase_price' => 'nullable|numeric|min:0',
            'selling_price' => 'nullable|numeric|min:0',
            'height_cm' => 'nullable|numeric|min:0',
            'length_cm' => 'nullable|numeric|min:0',
            'width_cm' => 'nullable|numeric|min:0',
            'depth_cm' => 'nullable|numeric|min:0',
            'price_start_cm' => 'nullable|integer|min:1',
            'price_step_cm' => 'nullable|integer|min:1',
            'price_step_amount' => 'nullable|numeric|min:0',
            'price_variants' => 'nullable|array',
            'price_variants.*.length_cm' => 'required_with:price_variants|numeric|min:1',
            'price_variants.*.width_cm' => 'required_with:price_variants|numeric|min:1',
            'price_variants.*.price' => 'required_with:price_variants|numeric|min:0',
            'stock_quantity' => 'nullable|integer|min:0',
            'min_stock_alert' => 'nullable|integer|min:0',
            'unit' => 'nullable|string|max:20',
        ];
    }
}
