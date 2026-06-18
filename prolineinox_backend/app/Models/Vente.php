<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;

class Vente extends Document
{
    /**
     * Apply a global scope to only retrieve ventes (sales).
     */
    protected static function booted()
    {
        static::addGlobalScope('vente_type', function (Builder $builder) {
            $builder->where('type', 'vente')->orWhere('document_type', 'vente');
        });
    }
}
