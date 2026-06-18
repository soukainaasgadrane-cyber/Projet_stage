<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\PurchaseDocumentRequest;
use App\Http\Resources\PurchaseDocumentResource;
use App\Models\Document;
use Illuminate\Http\Request;

class SupplierInvoiceController extends Controller
{
    protected $type = 'supplier_invoice';

    public function index(Request $request)
    {
        $query = Document::where('type', $this->type)->with('company', 'items');
        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
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

    public function show(Document $purch_invoice)
    {
        $purch_invoice->load('company', 'items');
        return new PurchaseDocumentResource($purch_invoice);
    }

    public function update(PurchaseDocumentRequest $request, Document $purch_invoice)
    {
        $purch_invoice->update($request->validated());
        return new PurchaseDocumentResource($purch_invoice->fresh());
    }

    public function destroy(Document $purch_invoice)
    {
        $purch_invoice->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
