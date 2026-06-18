<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BankAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'account_number', 'balance'
    ];

    protected $casts = [
        'balance' => 'decimal:2',
    ];

    public function getBankNameAttribute()
    {
        return $this->name;
    }

    public function setBankNameAttribute($value): void
    {
        $this->attributes['name'] = $value;
    }

    public function getInitialBalanceAttribute()
    {
        return $this->balance;
    }

    public function setInitialBalanceAttribute($value): void
    {
        $this->attributes['balance'] = $value ?? 0;
    }

    public function getCurrentBalanceAttribute()
    {
        return $this->balance;
    }

    public function setCurrentBalanceAttribute($value): void
    {
        $this->attributes['balance'] = $value ?? 0;
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function reconciliations()
    {
        return $this->hasMany(Reconciliation::class);
    }

    public function chequeDeposits()
    {
        return $this->hasMany(ChequeDeposit::class);
    }
}
