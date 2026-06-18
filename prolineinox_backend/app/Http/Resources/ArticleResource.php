<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ArticleResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'description' => $this->description,
            'image_path' => $this->image_path,
            'image_filename' => $this->image_filename,
            'image_url' => $this->image_path ? '/storage/' . ltrim($this->image_path, '/') : null,
            'category_id' => $this->category_id,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'purchase_price' => $this->purchase_price,
            'selling_price' => $this->selling_price,
            'height_cm' => $this->height_cm,
            'length_cm' => $this->length_cm,
            'width_cm' => $this->width_cm,
            'depth_cm' => $this->depth_cm,
            'price_start_cm' => $this->price_start_cm,
            'price_step_cm' => $this->price_step_cm,
            'price_step_amount' => $this->price_step_amount,
            'price_variants' => $this->price_variants ?? [],
            'stock_quantity' => $this->stock_quantity,
            'min_stock_alert' => $this->min_stock_alert,
            'unit' => $this->unit,
            'created_at' => $this->created_at,
        ];
    }
}
