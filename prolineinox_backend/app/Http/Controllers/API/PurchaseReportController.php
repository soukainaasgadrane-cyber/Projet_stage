<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Document;
use Illuminate\Http\Request;

class PurchaseReportController extends Controller
{
    public function index(Request $request)
    {
        $totalInvoices = Document::where('type', 'supplier_invoice')->sum('total');
        $totalCreditNotes = Document::where('type', 'supplier_credit_note')->sum('total');
        $outstanding = Document::where('type', 'supplier_invoice')->whereNotIn('status', ['paid', 'facturee'])->sum('total');

        return response()->json([
            'total_invoices' => $totalInvoices,
            'total_credit_notes' => $totalCreditNotes,
            'outstanding' => $outstanding,
        ]);
    }

    public function supplierFollowUp(Request $request)
    {
        $suppliers = Company::with(['documents' => function ($q) {
            $q->where('type', 'supplier_invoice')->whereNotIn('status', ['paid', 'facturee']);
        }])->get()->map(function ($company) {
            $outstanding = $company->documents->sum('total');
            return [
                'company_id' => $company->id,
                'name' => $company->name,
                'outstanding' => $outstanding,
                'open_invoices' => $company->documents->count(),
            ];
        });

        return response()->json($suppliers);
    }

    public function history(Request $request)
    {
        $history = Document::whereIn('type', ['supplier_invoice', 'purchase_order', 'purchase_request', 'goods_reception'])
            ->orderBy('document_date', 'desc')
            ->take(50)
            ->get();

        return response()->json($history);
    }

    public function stats(Request $request)
    {
        $period = $request->get('period', 'month');
        if ($period === 'month') {
            $by = Document::where('type', 'supplier_invoice')
                ->selectRaw("MONTH(document_date) as month, SUM(total) as amount")
                ->groupBy('month')
                ->get();
            return response()->json($by);
        }
        $total = Document::where('type', 'supplier_invoice')->sum('total');
        return response()->json(['total' => $total]);
    }
}
