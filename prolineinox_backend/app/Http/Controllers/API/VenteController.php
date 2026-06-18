<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Document;

class VenteController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->query('per_page', 15);
        $items = Document::where('type', 'vente')
            ->orWhere('document_type', 'vente')
            ->paginate($perPage);

        return response()->json($items);
    }

    public function store(Request $request)
    {
        $data = $request->all();
        $data['type'] = 'vente';

        $vente = Document::create($data);

        return response()->json($vente, 201);
    }

    public function show($id)
    {
        $vente = Document::where('type', 'vente')
            ->orWhere('document_type', 'vente')
            ->findOrFail($id);

        return response()->json($vente);
    }

    public function update(Request $request, $id)
    {
        $vente = Document::findOrFail($id);
        $vente->update($request->all());

        return response()->json($vente);
    }

    public function destroy($id)
    {
        $vente = Document::findOrFail($id);
        $vente->delete();

        return response()->json(null, 204);
    }
}
