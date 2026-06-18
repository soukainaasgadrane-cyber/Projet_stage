<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;

class Facture extends Document
{
    /**
     * Apply a global scope to only retrieve invoices (factures).
     */
    protected static function booted()
    {
        static::addGlobalScope('facture_type', function (Builder $builder) {
            $builder->where('type', 'facture')->orWhere('document_type', 'facture');
        });
    }
}
