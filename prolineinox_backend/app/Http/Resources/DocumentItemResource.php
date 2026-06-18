<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class DocumentItemResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'article_id' => $this->article_id,
            'article' => new ArticleResource($this->whenLoaded('article')),
            'line_type' => $this->line_type ?? 'article',
            'reference' => $this->reference,
            'description' => $this->description,
            'details' => $this->details,
            'quantity' => $this->quantity,
            'unit' => $this->unit,
            'unit_price' => $this->unit_price,
            'discount_percent' => $this->discount_percent,
            'tax_rate' => $this->tax_rate,
            'total' => $this->total,
        ];
    }
}
