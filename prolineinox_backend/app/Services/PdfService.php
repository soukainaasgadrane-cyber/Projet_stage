<?php

namespace App\Services;

use App\Models\Document;
use Illuminate\Support\Facades\View;

class PdfService
{
    public function generateSalePdf(Document $document)
    {
        $document->loadMissing([
            'company',
            'contact',
            'items.article',
            'creator',
            'transactions',
            'parentDocument.parentDocument.parentDocument.parentDocument',
        ]);

        $data = [
            'document' => $document,
            'company' => $document->company ?? null,
            'items' => $document->items ?? [],
            'logo_path' => file_exists(public_path('logo.jpeg')) ? public_path('logo.jpeg') : null,
            'site_url' => config('app.url') ?? env('APP_URL'),
        ];

        if (class_exists('\Barryvdh\DomPDF\Facade\Pdf')) {
            try {
                $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.document', $data);
                return $pdf->stream('sale_'.$document->id.'.pdf')->withHeaders([
                    'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
                    'Pragma' => 'no-cache',
                ]);
            } catch (\Throwable $e) {
                return response()->json(['error' => 'PDF generation failed', 'detail' => $e->getMessage()], 500);
            }
        }

        if (View::exists('pdf.document')) {
            return response()->view('pdf.document', $data)->withHeaders([
                'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
                'Pragma' => 'no-cache',
            ]);
        }

        return response()->json(['message' => 'PDF renderer not available'], 501);
    }

    public function generateDocumentPdf(Document $document)
    {
        // Backwards-compatible alias
        return $this->generateSalePdf($document);
    }
}
