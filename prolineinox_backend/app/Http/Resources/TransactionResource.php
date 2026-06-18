<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'amount' => $this->amount,
            'transaction_date' => $this->transaction_date,
            'payment_method' => $this->payment_method,
            'reference' => $this->reference,
            'description' => $this->description,
            'bank_account' => new BankAccountResource($this->whenLoaded('bankAccount')),
            'transactionable_type' => $this->transactionable_type,
            'transactionable_id' => $this->transactionable_id,
            'created_at' => $this->created_at,
        ];
    }
}