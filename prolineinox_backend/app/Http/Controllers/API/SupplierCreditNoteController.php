<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\PurchaseDocumentRequest;
use App\Http\Resources\PurchaseDocumentResource;
use App\Models\Document;
use Illuminate\Http\Request;

class SupplierCreditNoteController extends Controller
{
    protected $type = 'supplier_credit_note';

    public function index(Request $request)
    {
        $query = Document::where('type', $this->type)->with('company', 'items');
        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
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

    public function show(Document $credit_note)
    {
        $credit_note->load('company', 'items');
        return new PurchaseDocumentResource($credit_note);
    }

    public function update(PurchaseDocumentRequest $request, Document $credit_note)
    {
        $credit_note->update($request->validated());
        return new PurchaseDocumentResource($credit_note->fresh());
    }

    public function destroy(Document $credit_note)
    {
        $credit_note->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
