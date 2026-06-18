<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'email', 'phone', 'address', 'city', 'country', 'tax_number'
    ];

    public function contacts()
    {
        return $this->hasMany(Contact::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    public function cheques()
    {
        return $this->hasMany(Cheque::class);
    }
}