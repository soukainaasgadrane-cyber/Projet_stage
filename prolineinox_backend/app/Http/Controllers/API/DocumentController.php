<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\DocumentRequest;
use App\Http\Resources\DocumentResource;
use App\Models\Document;
use App\Models\DocumentItem;
use App\Models\Article;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Services\PdfService;

class DocumentController extends Controller
{
    public function __construct(private PdfService $pdfService)
    {
    }

    // ================== LISTE & FILTRES ==================
    public function index(Request $request)
    {
        $query = Document::with(['company', 'contact', 'creator']);
        
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('company_id')) {
            $query->where('company_id', $request->company_id);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%")
                    ->orWhereHas('company', function ($companyQuery) use ($search) {
                        $companyQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }
        
        $documents = $query->orderBy('id', 'desc')->paginate(20);
        return DocumentResource::collection($documents);
    }

    // ================== CRÉATION ==================
    public function store(DocumentRequest $request)
    {
        $reference = $request->filled('reference') ? $request->reference : $this->generateReference($request->type);
        
        $document = Document::create([
            'reference' => $reference,
            'client_reference' => $request->client_reference,
            'type' => $request->type,
            'company_id' => $request->company_id,
            'contact_id' => $request->contact_id,
            'responsible_name' => $request->responsible_name,
            'subject' => $request->subject,
            'document_date' => $request->document_date,
            'due_date' => $request->due_date,
            'notes' => $request->notes,
            'subtotal' => 0,
            'tax' => 0,
            'discount' => 0,
            'total' => 0,
            'status' => $request->status ?? 'brouillon',
            'delivery_status' => $request->delivery_status ?? 'pending',
            'payment_status' => $request->payment_status ?? 'unpaid',
            'advance_amount' => $request->advance_amount ?? 0,
            'created_by' => auth()->id(),
        ]);

        if ($request->has('items')) {
            $this->syncDocumentItems($document, $request->items ?? []);
        }
        
        return new DocumentResource($document->load(['company', 'contact', 'items.article', 'creator']));
    }

    // ================== AFFICHAGE ==================
    public function show(Document $document)
    {
        $document->load(['company', 'contact', 'items.article', 'creator']);
        return new DocumentResource($document);
    }

    public function nextReference(string $type)
    {
        return response()->json([
            'reference' => $this->generateReference($type),
        ]);
    }
// Créer un avoir (credit_note) à partir d'une facture
public function createCreditNote(Document $invoice)
{
    if ($invoice->type !== 'invoice') {
        return response()->json(['message' => 'Un avoir ne peut être créé que depuis une facture'], 422);
    }

    $creditNote = Document::create([
        'reference' => $this->generateReference('credit_note'),
        'type' => 'credit_note',
        'company_id' => $invoice->company_id,
        'contact_id' => $invoice->contact_id,
        'parent_document_id' => $invoice->id,
        'document_date' => now(),
        'due_date' => null,
        'subtotal' => $invoice->subtotal,
        'tax' => $invoice->tax,
        'discount' => $invoice->discount,
        'total' => $invoice->total,
        'status' => 'brouillon',
        'created_by' => auth()->id(),
    ]);

    // Copier les lignes de la facture
    foreach ($invoice->items as $item) {
        DocumentItem::create([
            'document_id' => $creditNote->id,
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

    // Option : marquer la facture comme partiellement créditée ?
    return new DocumentResource($creditNote->load('items'));
}

// Générer les factures récurrentes (à appeler via cron)
public static function generateRecurringInvoices()
{
    $settings = RecurringInvoiceSetting::with('document')->where('next_generation_date', '<=', now())->get();
    foreach ($settings as $setting) {
        $original = $setting->document;
        $newInvoice = Document::create([
            'reference' => (new self)->generateReference('invoice'),
            'type' => 'invoice',
            'company_id' => $original->company_id,
            'contact_id' => $original->contact_id,
            'document_date' => now(),
            'due_date' => now()->addDays(30),
            'subtotal' => $original->subtotal,
            'tax' => $original->tax,
            'discount' => $original->discount,
            'total' => $original->total,
            'status' => 'brouillon',
            'created_by' => $original->created_by,
        ]);

        foreach ($original->items as $item) {
            DocumentItem::create([
                'document_id' => $newInvoice->id,
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

        // Mettre à jour la prochaine date
        $nextDate = now();
        switch ($setting->frequency) {
            case 'monthly': $nextDate = now()->addMonths($setting->interval_count); break;
            case 'quarterly': $nextDate = now()->addQuarters($setting->interval_count); break;
            case 'yearly': $nextDate = now()->addYears($setting->interval_count); break;
        }
        $setting->update(['next_generation_date' => $nextDate]);
    }
}
    // ================== MISE À JOUR (hors lignes) ==================
    public function update(DocumentRequest $request, Document $document)
    {
        $data = $request->only([
            'reference', 'client_reference', 'company_id', 'contact_id', 'responsible_name', 'subject', 'status',
            'document_date', 'due_date', 'delivery_status', 'payment_status', 'advance_amount', 'notes'
        ]);

        if (empty($data['reference'])) {
            unset($data['reference']);
        }

        $document->update($data);

        if ($request->has('items')) {
            $this->syncDocumentItems($document, $request->items ?? []);
        }
        
        return new DocumentResource($document->load(['company', 'contact', 'items.article', 'creator']));
    }

    // ================== SUPPRESSION (si brouillon) ==================
    public function destroy(Document $document)
    {
        if (!in_array($document->status, ['draft', 'brouillon'])) {
            return response()->json(['message' => 'Cannot delete non-draft document'], 422);
        }
        $document->items()->delete();
        $document->delete();
        return response()->json(['message' => 'Document deleted']);
    }

    // ================== GESTION DES LIGNES ==================
    public function addItem(Request $request, Document $document)
    {
        $request->validate([
            'article_id'   => 'nullable|exists:articles,id',
            'reference'    => 'nullable|string|max:255',
            'description'  => 'required|string',
            'details'      => 'nullable|string',
            'quantity'     => 'required|numeric|min:0.01',
            'unit'         => 'nullable|string|max:50',
            'unit_price'   => 'required|numeric|min:0',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            'tax_rate'     => 'nullable|numeric|min:0|max:100',
        ]);
        
        $quantity = $request->quantity;
        $unit_price = $request->unit_price;
        $discount_percent = $request->discount_percent ?? 0;
        $tax_rate = $request->tax_rate ?? 0;
        
        $line_total = $quantity * $unit_price;
        $discount_amount = $line_total * ($discount_percent / 100);
        $after_discount = $line_total - $discount_amount;
        $tax_amount = $after_discount * ($tax_rate / 100);
        $total_line = $after_discount + $tax_amount;
        
        $item = DocumentItem::create([
            'document_id' => $document->id,
            'article_id' => $request->article_id,
            'line_type' => 'article',
            'reference' => $request->reference,
            'description' => $request->description,
            'details' => $request->details,
            'quantity' => $quantity,
            'unit' => $request->unit,
            'unit_price' => $unit_price,
            'discount_percent' => $discount_percent,
            'tax_rate' => $tax_rate,
            'total' => $total_line,
        ]);
        
        $this->recalculateDocumentTotals($document);
        
        return response()->json(['message' => 'Item added', 'item' => $item]);
    }

    public function removeItem(Document $document, DocumentItem $item)
    {
        if ($item->document_id !== $document->id) {
            return response()->json(['message' => 'Item not found in this document'], 404);
        }
        $item->delete();
        $this->recalculateDocumentTotals($document);
        return response()->json(['message' => 'Item removed']);
    }

    // ================== CONVERSION DE DOCUMENT ==================
    public function convert(Request $request, Document $document, $targetType)
    {
        $allowedConversions = [
            'quote' => ['proforma', 'order'],
            'proforma' => ['order'],
            'order' => ['delivery_note', 'invoice'],
            'delivery_note' => ['invoice'],
            'purchase_request' => ['purchase_order'],
            'purchase_order'   => ['receipt_note', 'supplier_invoice'],
            'receipt_note'     => ['supplier_invoice'],
            'supplier_invoice' => [],
            ];
        
        if (!isset($allowedConversions[$document->type]) || !in_array($targetType, $allowedConversions[$document->type])) {
            return response()->json(['message' => 'Conversion not allowed'], 422);
        }

        $validated = $request->validate([
            'document_date' => 'nullable|date',
            'due_date' => 'nullable|date',
            'responsible_name' => 'nullable|string|max:255',
            'subject' => 'nullable|string|max:255',
        ]);

        $documentDate = $validated['document_date'] ?? now()->toDateString();
        $dueDate = array_key_exists('due_date', $validated)
            ? $validated['due_date']
            : ($targetType === 'invoice' ? now()->addDays(30)->toDateString() : null);
        
        $newDocument = Document::create([
            'reference' => $this->generateReference($targetType),
            'type' => $targetType,
            'company_id' => $document->company_id,
            'contact_id' => $document->contact_id,
            'parent_document_id' => $document->id,
            'client_reference' => $document->client_reference,
            'responsible_name' => $validated['responsible_name'] ?? $document->responsible_name,
            'subject' => $validated['subject'] ?? $document->subject,
            'document_date' => $documentDate,
            'due_date' => $dueDate,
            'notes' => $document->notes,
            'subtotal' => $document->subtotal,
            'tax' => $document->tax,
            'discount' => $document->discount,
            'total' => $document->total,
            'status' => 'brouillon',
            'delivery_status' => $document->delivery_status ?? 'pending',
            'payment_status' => $document->payment_status ?? 'unpaid',
            'advance_amount' => $document->advance_amount ?? 0,
            'created_by' => auth()->id(),
        ]);
        
        foreach ($document->items as $item) {
            DocumentItem::create([
                'document_id' => $newDocument->id,
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
        
        $document->update(['status' => 'validee', 'validated_at' => now()->toDateString()]);
        
        return new DocumentResource($newDocument);
    }

    // ================== VALIDATION SIMPLE ==================
    public function validateDocument(Document $document)
    {
        if ($document->items->count() == 0) {
            return response()->json(['message' => 'Cannot validate empty document'], 422);
        }
        $document->update(['status' => 'validee', 'validated_at' => now()->toDateString()]);
        
        if ($document->type === 'invoice') {
            $this->updateStock($document, -1);
        }
        return response()->json(['message' => 'Document validated']);
    }

    // ================== WORKFLOW : CHANGEMENTS D'ÉTAT ==================
    public function markAsSent(Document $document)
    {
        if (!in_array($document->status, ['draft', 'brouillon'])) {
            return response()->json(['message' => 'Seul un brouillon peut être marqué comme envoyé'], 422);
        }
        $document->update(['status' => 'acceptee']);
        return new DocumentResource($document->load(['company', 'contact', 'items.article']));
    }

    public function markAsApproved(Document $document)
    {
        if (!in_array($document->status, ['draft', 'brouillon', 'sent', 'acceptee'])) {
            return response()->json(['message' => 'Seul un document en brouillon ou envoyé peut être approuvé'], 422);
        }
        if ($document->items->count() == 0) {
            return response()->json(['message' => 'Impossible d’approuver un document vide'], 422);
        }
        $document->update(['status' => 'validee', 'validated_at' => now()->toDateString()]);

        if ($document->type === 'invoice') {
            $this->updateStock($document, -1); // diminution du stock
        }
        return new DocumentResource($document->load(['company', 'contact', 'items.article']));
    }

    public function markAsPartial(Document $document)
    {
        if (!in_array($document->status, ['approved', 'validee', 'sent', 'acceptee'])) {
            return response()->json(['message' => 'Seul un document approuvé ou envoyé peut être partiel'], 422);
        }
        $document->update(['status' => 'partielle']);
        return new DocumentResource($document->load(['company', 'contact', 'items.article']));
    }

    public function markAsPaid(Document $document)
    {
        if ($document->type !== 'invoice') {
            return response()->json(['message' => 'Seule une facture peut être marquée payée'], 422);
        }
        if (!in_array($document->status, ['approved', 'validee', 'partial', 'partielle'])) {
            return response()->json(['message' => 'La facture doit être approuvée ou partielle avant d’être payée'], 422);
        }
        $document->update(['status' => 'facturee']);

        Transaction::create([
            'transactionable_type' => 'App\Models\Document',
            'transactionable_id' => $document->id,
            'type' => 'income',
            'amount' => $document->total,
            'transaction_date' => now()->toDateString(),
            'payment_method' => 'auto',
            'reference' => 'PAY-' . $document->reference,
            'description' => 'Paiement automatique pour la facture ' . $document->reference,
            'bank_account_id' => null,
        ]);

        return new DocumentResource($document->load(['company', 'contact', 'items.article']));
    }

    public function cancel(Document $document)
    {
        if (in_array($document->status, ['paid', 'facturee', 'cancelled', 'annulee'])) {
            return response()->json(['message' => 'Ce document ne peut pas être annulé'], 422);
        }

        if ($document->type === 'invoice' && in_array($document->status, ['approved', 'validee'])) {
            $this->updateStock($document, +1); // restauration du stock
        }
        $document->update(['status' => 'annulee']);
        return response()->json(['message' => 'Document annulé avec succès']);
    }

    // ================== GÉNÉRATION PDF (placeholder) ==================
    public function generatePdf(Document $document)
    {
        return $this->pdfService->generateDocumentPdf($document);
    }

    // ================== DUPLICATION ==================
    public function duplicate(Document $document)
    {
        $newReference = $this->generateReference($document->type);
        $newDocument = Document::create([
            'reference' => $newReference,
            'type' => $document->type,
            'company_id' => $document->company_id,
            'contact_id' => $document->contact_id,
            'client_reference' => $document->client_reference,
            'responsible_name' => $document->responsible_name,
            'subject' => $document->subject,
            'document_date' => now(),
            'due_date' => $document->due_date,
            'notes' => $document->notes . ' (copie)',
            'subtotal' => $document->subtotal,
            'tax' => $document->tax,
            'discount' => $document->discount,
            'total' => $document->total,
            'status' => 'brouillon',
            'created_by' => auth()->id(),
        ]);

        foreach ($document->items as $item) {
            DocumentItem::create([
                'document_id' => $newDocument->id,
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

        return new DocumentResource($newDocument->load('items.article'));
    }

    // ================== MÉTHODES PRIVÉES ==================
    private function generateReference($type)
    {
        $prefixes = [
            'quote'           => 'D',
            'proforma'        => 'FP',
            'order'           => 'C',
            'delivery_note'   => 'BL',
            'invoice'         => 'F',
            'credit_note'     => 'AV',
            'purchase_request' => 'DA',
            'purchase_order'  => 'BCA',
            'receipt_note' => 'BR',
            'supplier_invoice' => 'FA',
            'supplier_credit_note' => 'AA',
        ];
        $prefix = $prefixes[$type] ?? 'DOC';
        $period = now()->format('Ym');
        $count = Document::where('type', $type)
            ->where('reference', 'like', "{$prefix}-{$period}-%")
            ->count() + 1;

        do {
            $reference = "{$prefix}-{$period}-" . str_pad($count, 3, '0', STR_PAD_LEFT);
            $count++;
        } while (Document::where('reference', $reference)->exists());

        return $reference;
    }

    private function recalculateDocumentTotals(Document $document)
    {
        $items = $document->items;
        $subtotal = $items->sum(function ($item) {
            if (($item->line_type ?? 'article') === 'section') {
                return 0;
            }
            $line = $item->quantity * $item->unit_price;
            $discount = $line * ($item->discount_percent / 100);
            return $line - $discount;
        });
        $tax = $items->sum(function ($item) {
            if (($item->line_type ?? 'article') === 'section') {
                return 0;
            }
            $line = $item->quantity * $item->unit_price;
            $discount = $line * ($item->discount_percent / 100);
            $afterDiscount = $line - $discount;
            return $afterDiscount * ($item->tax_rate / 100);
        });
        $total = $subtotal + $tax;
        
        $document->update([
            'subtotal' => $subtotal,
            'tax'      => $tax,
            'total'    => $total,
        ]);
    }

    private function updateStock(Document $document, $multiplier = -1)
    {
        foreach ($document->items as $item) {
            if (($item->line_type ?? 'article') !== 'section' && $item->article_id) {
                $article = Article::find($item->article_id);
                if ($article) {
                    $newStock = $article->stock_quantity + ($multiplier * $item->quantity);
                    $article->update(['stock_quantity' => max(0, $newStock)]);
                }
            }
        }
    }

    private function syncDocumentItems(Document $document, array $items)
    {
        $document->items()->delete();

        foreach ($items as $itemData) {
            $lineType = $itemData['line_type'] ?? 'article';
            if ($lineType === 'section') {
                if (empty($itemData['description'])) {
                    continue;
                }

                DocumentItem::create([
                    'document_id' => $document->id,
                    'line_type' => 'section',
                    'description' => $itemData['description'],
                    'details' => $itemData['details'] ?? null,
                    'quantity' => 1,
                    'unit_price' => 0,
                    'discount_percent' => 0,
                    'tax_rate' => 0,
                    'total' => 0,
                ]);
                continue;
            }

            $quantity = (float) ($itemData['quantity'] ?? 0);
            $unitPrice = (float) ($itemData['unit_price'] ?? 0);
            $taxRate = (float) ($itemData['tax_rate'] ?? 0);

            if ($quantity <= 0 || $unitPrice < 0 || empty($itemData['description'])) {
                continue;
            }

            $lineHt = $quantity * $unitPrice;
            $taxAmount = $lineHt * ($taxRate / 100);

            DocumentItem::create([
                'document_id' => $document->id,
                'article_id' => $itemData['article_id'] ?? null,
                'line_type' => 'article',
                'reference' => $itemData['reference'] ?? null,
                'description' => $itemData['description'],
                'details' => $itemData['details'] ?? null,
                'quantity' => $quantity,
                'unit' => $itemData['unit'] ?? null,
                'unit_price' => $unitPrice,
                'discount_percent' => 0,
                'tax_rate' => $taxRate,
                'total' => $lineHt + $taxAmount,
            ]);
        }

        $document->load('items');
        $this->recalculateDocumentTotals($document);
    }
}
