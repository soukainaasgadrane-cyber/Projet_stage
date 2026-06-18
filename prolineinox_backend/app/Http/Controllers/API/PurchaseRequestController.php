<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\PurchaseDocumentRequest;
use App\Http\Resources\PurchaseDocumentResource;
use App\Models\Document;
use Illuminate\Http\Request;

class PurchaseRequestController extends Controller
{
    protected $type = 'purchase_request';

    public function index(Request $request)
    {
        $query = Document::where('type', $this->type)->with('company', 'items');
        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }
        if ($request->filled('start') && $request->filled('end')) {
            $query->whereBetween('document_date', [$request->start, $request->end]);
        }
        return PurchaseDocumentResource::collection($query->paginate(20));
    }

    public function store(PurchaseDocumentRequest $request)
    {
        $data = $request->validated();
        $data['type'] = $this->type;
        $doc = Document::create($data + ['created_by' => auth()->id() ?? null]);
        return new PurchaseDocumentResource($doc);
    }

    public function show(Document $purchase_request)
    {
        $purchase_request->load('company', 'items');
        return new PurchaseDocumentResource($purchase_request);
    }

    public function update(PurchaseDocumentRequest $request, Document $purchase_request)
    {
        $purchase_request->update($request->validated());
        return new PurchaseDocumentResource($purchase_request->fresh());
    }

    public function destroy(Document $purchase_request)
    {
        $purchase_request->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
