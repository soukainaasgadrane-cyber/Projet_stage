<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ChequeResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'cheque_number' => $this->cheque_number,
            'company' => new CompanyResource($this->whenLoaded('company')),
            'amount' => $this->amount,
            'issue_date' => $this->issue_date,
            'due_date' => $this->due_date,
            'bank_name' => $this->bank_name,
            'status' => $this->status,
            'created_at' => $this->created_at,
        ];
    }
}