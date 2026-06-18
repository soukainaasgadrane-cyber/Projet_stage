<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasFactory;

    protected $fillable = [
        'code', 'name', 'description', 'image_path', 'image_filename', 'category_id',
        'purchase_price', 'selling_price', 'stock_quantity',
        'min_stock_alert', 'unit', 'height_cm', 'length_cm', 'width_cm', 'depth_cm',
        'price_start_cm', 'price_step_cm', 'price_step_amount', 'price_variants'
    ];

    protected $casts = [
        'purchase_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'stock_quantity' => 'integer',
        'height_cm' => 'decimal:2',
        'length_cm' => 'decimal:2',
        'width_cm' => 'decimal:2',
        'depth_cm' => 'decimal:2',
        'price_start_cm' => 'integer',
        'price_step_cm' => 'integer',
        'price_step_amount' => 'decimal:2',
        'price_variants' => 'array',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function documentItems()
    {
        return $this->hasMany(DocumentItem::class);
    }
}
