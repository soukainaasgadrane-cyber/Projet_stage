<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChequeDeposit extends Model
{
    use HasFactory;

    protected $fillable = ['bank_account_id', 'deposit_date', 'total_amount', 'status'];

    protected $casts = [
        'deposit_date' => 'date',
        'total_amount' => 'decimal:2',
    ];

    public function bankAccount()
    {
        return $this->belongsTo(BankAccount::class);
    }

    public function cheques()
    {
        return $this->belongsToMany(Cheque::class, 'cheque_deposit_cheque');
    }
}