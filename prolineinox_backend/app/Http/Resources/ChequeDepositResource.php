<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ChequeDepositResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'bank_account' => new BankAccountResource($this->whenLoaded('bankAccount')),
            'deposit_date' => $this->deposit_date,
            'total_amount' => $this->total_amount,
            'status' => $this->status,
            'cheques' => ChequeResource::collection($this->whenLoaded('cheques')),
            'created_at' => $this->created_at,
        ];
    }
}