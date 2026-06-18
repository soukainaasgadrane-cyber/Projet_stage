<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Grow extends Model
{
    use HasFactory;

    protected $table = 'grow';

    protected $fillable = [
        'user_id', 'objective', 'target_value', 'current_value',
        'start_date', 'end_date', 'status'
    ];

    protected $casts = [
        'target_value' => 'decimal:2',
        'current_value' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}