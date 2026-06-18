<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReconciliationItem extends Model
{
    use HasFactory;

    protected $fillable = ['reconciliation_id', 'transaction_id', 'is_matched'];

    protected $casts = [
        'is_matched' => 'boolean',
    ];

    public function reconciliation()
    {
        return $this->belongsTo(Reconciliation::class);
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }
}