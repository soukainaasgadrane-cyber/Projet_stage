<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\DocumentItem;
use App\Models\Document;
use Illuminate\Http\Request;

class CatalogueReportController extends Controller
{
    public function inventory(Request $request)
    {
        return response()->json([
            'alerts' => Article::whereColumn('stock_quantity', '<=', 'min_stock_alert')->get(),
            'rotation' => $this->rotation($request)->getData(),
            'sold' => $this->sold($request)->getData(),
        ]);
    }

    public function rotation(Request $request)
    {
        $periodStart = $request->get('start');
        $periodEnd = $request->get('end');

        $items = DocumentItem::selectRaw('article_id, SUM(quantity) as sold')
            ->join('documents', 'documents.id', '=', 'document_items.document_id')
            ->whereNotLike('documents.type', 'supplier_%')
            ->when($periodStart && $periodEnd, function ($q) use ($periodStart, $periodEnd) {
                $q->whereBetween('documents.document_date', [$periodStart, $periodEnd]);
            })
            ->groupBy('article_id')
            ->orderByDesc('sold')
            ->with('article')
            ->limit(50)
            ->get();

        return response()->json($items);
    }

    public function sold(Request $request)
    {
        $articleId = $request->get('article_id');
        $query = DocumentItem::join('documents', 'documents.id', '=', 'document_items.document_id')
            ->whereNotLike('documents.type', 'supplier_%');
        if ($articleId) $query->where('article_id', $articleId);
        $data = $query->selectRaw('article_id, SUM(quantity) as total_sold, SUM(total) as revenue')
            ->groupBy('article_id')
            ->orderByDesc('total_sold')
            ->get();
        return response()->json($data);
    }

    public function alerts(Request $request)
    {
        $articles = Article::whereColumn('stock_quantity', '<=', 'min_stock_alert')->get();
        return response()->json($articles);
    }
}
