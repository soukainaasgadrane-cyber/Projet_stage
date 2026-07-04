<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class DocumentResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'client_reference' => $this->client_reference,
            'type' => $this->type,
            'company' => new CompanyResource($this->whenLoaded('company')),
            'contact' => new ContactResource($this->whenLoaded('contact')),
            'items' => DocumentItemResource::collection($this->whenLoaded('items')),
            'document_date' => $this->document_date,
            'due_date' => $this->due_date,
            'validated_at' => $this->validated_at,
            'responsible_name' => $this->responsible_name,
            'subject' => $this->subject,
            'subtotal' => $this->subtotal,
            'tax' => $this->tax,
            'discount' => $this->discount,
            'total' => $this->total,
            'status' => $this->status,
            'delivery_status' => $this->delivery_status,
            'payment_status' => $this->payment_status,
            'advance_amount' => $this->advance_amount,
            'notes' => $this->notes,
            'created_by' => $this->creator->full_name ?? null,
            'created_at' => $this->created_at,
            'pdf_url' => url('/api/documents/'.$this->id.'/pdf'),
        ];
    }
}
