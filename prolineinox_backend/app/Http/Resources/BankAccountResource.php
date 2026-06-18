<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class BankAccountResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'bank_name' => $this->bank_name,
            'account_number' => $this->account_number,
            'rib' => $this->rib ?? null,
            'balance' => $this->balance,
            'initial_balance' => $this->initial_balance,
            'current_balance' => $this->current_balance,
            'created_at' => $this->created_at,
        ];
    }
}
