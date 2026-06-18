<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ReconciliationResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'bank_account' => new BankAccountResource($this->whenLoaded('bankAccount')),
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'statement_balance' => $this->statement_balance,
            'system_balance' => $this->system_balance,
            'difference' => $this->statement_balance - $this->system_balance,
            'status' => $this->status,
            'items' => ReconciliationItemResource::collection($this->whenLoaded('items')),
            'created_at' => $this->created_at,
        ];
    }
}