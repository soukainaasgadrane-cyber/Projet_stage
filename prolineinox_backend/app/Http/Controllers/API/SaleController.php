<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Repositories\SaleRepository;
use App\Services\PdfService;
use App\Models\Document;

class SaleController extends Controller
{
    protected $repo;
    protected $pdf;

    public function __construct(SaleRepository $repo, PdfService $pdf)
    {
        $this->repo = $repo;
        $this->pdf = $pdf;
    }

    // GET /api/sales?search=&status=&company_id=&per_page=20
    public function index(Request $request)
    {
        $q = $request->query('search');
        $perPage = (int) $request->query('per_page', 20);
        $query = $this->repo->search($q);
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }
        return $query->paginate($perPage);
    }

    public function show(Document $sale)
    {
        $sale->load('company', 'items');
        return response()->json($sale);
    }

    public function generatePdf(Document $sale, Request $request)
    {
        return $this->pdf->generateSalePdf($sale);
    }
}
