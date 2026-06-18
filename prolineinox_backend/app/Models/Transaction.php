<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'transactionable_type', 'transactionable_id', 'type',
        'amount', 'transaction_date', 'payment_method',
        'reference', 'description', 'bank_account_id'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'transaction_date' => 'date',
    ];

    public function transactionable()
    {
        return $this->morphTo();
    }

    public function bankAccount()
    {
        return $this->belongsTo(BankAccount::class);
    }

    public function cheque()
    {
        return $this->hasOne(Cheque::class);
    }

    public function reconciliationItems()
    {
        return $this->hasMany(ReconciliationItem::class);
    }
}