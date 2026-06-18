<?php

namespace App\Services;

use App\Models\Document;

class VenteService
{
    public function create(array $data): Document
    {
        $data['type'] = $data['type'] ?? 'vente';
        return Document::create($data);
    }

    public function find(int $id): ?Document
    {
        return Document::find($id);
    }

    public function list(int $perPage = 15)
    {
        return Document::where('type', 'vente')->paginate($perPage);
    }

    public function update(Document $document, array $data): Document
    {
        $document->update($data);
        return $document;
    }
}
