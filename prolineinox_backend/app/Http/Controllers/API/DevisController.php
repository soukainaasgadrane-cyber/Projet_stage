<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\DevisRequest;
use App\Models\Document;
use App\Services\PdfService;

class DevisController extends Controller
{
    protected $pdf;

    public function __construct(PdfService $pdf)
    {
        $this->pdf = $pdf;
    }

    public function index(Request $request)
    {
        $q = $request->query('search');
        $perPage = (int) $request->query('per_page', 20);

        $query = Document::where('type', 'quote')->with('company', 'items');
        if (!empty($q)) {
            $query->where(function ($sub) use ($q) {
                $sub->where('reference', 'like', "%{$q}%")
                    ->orWhere('notes', 'like', "%{$q}%")
                    ->orWhereHas('company', function ($c) use ($q) {
                        $c->where('name', 'like', "%{$q}%");
                    });
            });
        }
        return $query->paginate($perPage);
    }

    public function store(DevisRequest $request)
    {
        $data = $request->validated();
        $data['type'] = 'quote';
        $doc = Document::create($data + ['created_by' => auth()->id() ?? null]);
        return response()->json($doc);
    }

    public function show(Document $devis)
    {
        $devis->load('company', 'items');
        return response()->json($devis);
    }

    public function update(DevisRequest $request, Document $devis)
    {
        $devis->update($request->validated());
        return response()->json($devis->fresh());
    }

    public function destroy(Document $devis)
    {
        $devis->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function convertToInvoice(Document $devis)
    {
        // create a new invoice from devis
        $invoice = $devis->replicate();
        $invoice->type = 'invoice';
        $invoice->parent_document_id = $devis->id;
        $invoice->reference = $invoice->reference ? $invoice->reference . '-INV' : null;
        $invoice->status = 'brouillon';
        $invoice->push();

        // duplicate items
        foreach ($devis->items as $item) {
            $invoice->items()->create([
                'article_id' => $item->article_id,
                'line_type' => $item->line_type ?? 'article',
                'reference' => $item->reference,
                'description' => $item->description,
                'details' => $item->details,
                'quantity' => $item->quantity,
                'unit' => $item->unit,
                'unit_price' => $item->unit_price,
                'discount_percent' => $item->discount_percent,
                'tax_rate' => $item->tax_rate,
                'total' => $item->total,
            ]);
        }

        return response()->json($invoice->load('items'));
    }

    public function generatePdf(Document $devis)
    {
        return $this->pdf->generateSalePdf($devis);
    }
}
