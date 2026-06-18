<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Document;

class FactureController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->query('per_page', 15);
        $items = Document::where('type', 'facture')
            ->orWhere('document_type', 'facture')
            ->paginate($perPage);

        return response()->json($items);
    }

    public function store(Request $request)
    {
        $data = $request->all();
        $data['type'] = 'facture';

        $facture = Document::create($data);

        return response()->json($facture, 201);
    }

    public function show($id)
    {
        $facture = Document::where('type', 'facture')
            ->orWhere('document_type', 'facture')
            ->findOrFail($id);

        return response()->json($facture);
    }

    public function update(Request $request, $id)
    {
        $facture = Document::findOrFail($id);
        $facture->update($request->all());

        return response()->json($facture);
    }

    public function destroy($id)
    {
        $facture = Document::findOrFail($id);
        $facture->delete();

        return response()->json(null, 204);
    }
}
