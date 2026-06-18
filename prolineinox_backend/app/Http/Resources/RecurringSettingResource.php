<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class RecurringSettingResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'document_id' => $this->document_id,
            'document' => new DocumentResource($this->whenLoaded('document')),
            'frequency' => $this->frequency,
            'interval_count' => $this->interval_count,
            'next_generation_date' => $this->next_generation_date,
            'end_date' => $this->end_date,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
