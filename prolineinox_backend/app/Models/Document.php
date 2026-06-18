<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference', 'client_reference', 'type', 'company_id', 'contact_id', 'parent_document_id',
        'responsible_name', 'document_date', 'due_date', 'validated_at', 'subtotal', 'tax', 'discount', 'total',
        'status', 'delivery_status', 'payment_status', 'advance_amount', 'notes', 'created_by'
    ];

    protected $casts = [
        'document_date' => 'date',
        'due_date' => 'date',
        'validated_at' => 'date',
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'advance_amount' => 'decimal:2',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function parentDocument()
    {
        return $this->belongsTo(Document::class, 'parent_document_id');
    }

    public function items()
    {
        return $this->hasMany(DocumentItem::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function transactions()
    {
        return $this->morphMany(Transaction::class, 'transactionable');
    }

    public function recurringSetting()
    {
        return $this->hasOne(RecurringInvoiceSetting::class);
    }
}
