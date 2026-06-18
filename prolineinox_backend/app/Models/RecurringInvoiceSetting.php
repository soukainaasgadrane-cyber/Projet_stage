<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RecurringInvoiceSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_id', 'frequency', 'interval_count',
        'next_generation_date', 'end_date'
    ];

    protected $casts = [
        'next_generation_date' => 'date',
        'end_date' => 'date',
        'interval_count' => 'integer',
    ];

    public function document()
    {
        return $this->belongsTo(Document::class);
    }
}