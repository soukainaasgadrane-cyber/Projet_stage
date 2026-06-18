<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ReconciliationItemResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'transaction' => new TransactionResource($this->whenLoaded('transaction')),
            'is_matched' => $this->is_matched,
        ];
    }
}