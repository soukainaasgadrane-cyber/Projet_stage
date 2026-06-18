<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseDocumentResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'type' => $this->type,
            'company' => new CompanyResource($this->whenLoaded('company')),
            'contact' => $this->whenLoaded('contact'),
            'document_date' => $this->document_date,
            'due_date' => $this->due_date,
            'subtotal' => $this->subtotal,
            'tax' => $this->tax,
            'discount' => $this->discount,
            'total' => $this->total,
            'status' => $this->status,
            'delivery_status' => $this->delivery_status,
            'payment_status' => $this->payment_status,
            'advance_amount' => $this->advance_amount,
            'notes' => $this->notes,
            'items' => $this->whenLoaded('items'),
            'created_by' => $this->created_by,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
