<?php

namespace App\Repositories;

use App\Models\Document;

class SaleRepository
{
    protected $type = 'invoice';

    public function query()
    {
        return Document::where('type', $this->type)->with('company', 'items');
    }

    public function search($q)
    {
        $query = $this->query();
        if (!empty($q)) {
            $query->where(function ($sub) use ($q) {
                $sub->where('reference', 'like', "%{$q}%")
                    ->orWhere('notes', 'like', "%{$q}%")
                    ->orWhereHas('company', function ($c) use ($q) {
                        $c->where('name', 'like', "%{$q}%");
                    });
            });
        }
        return $query;
    }
}
