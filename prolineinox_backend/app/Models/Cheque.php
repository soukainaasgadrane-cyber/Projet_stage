<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cheque extends Model
{
    use HasFactory;

    protected $fillable = [
        'cheque_number', 'transaction_id', 'company_id', 'amount',
        'issue_date', 'due_date', 'status', 'bank_name'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'issue_date' => 'date',
        'due_date' => 'date',
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function chequeDeposits()
    {
        return $this->belongsToMany(ChequeDeposit::class, 'cheque_deposit_cheque');
    }
}