<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Transaction;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->get('period', 'year'); // day|month|year
        $start = $request->get('start');
        $end = $request->get('end');

        // Determine range based on period if not provided
        if (!$start || !$end) {
            if ($period === 'day') {
                $start = Carbon::today()->toDateString();
                $end = Carbon::today()->toDateString();
            } elseif ($period === 'month') {
                $start = Carbon::now()->startOfMonth()->toDateString();
                $end = Carbon::now()->endOfMonth()->toDateString();
            } else {
                $start = Carbon::now()->startOfYear()->toDateString();
                $end = Carbon::now()->endOfYear()->toDateString();
            }
        }

        // Chiffre d'affaires (factures payées) sur la période
        $ca = Document::where('type', 'invoice')
            ->whereIn('status', ['paid', 'facturee'])
            ->whereBetween('document_date', [$start, $end])
            ->sum('total');

        // Recettes / Dépenses sur la période
        $recettes = Transaction::whereIn('type', ['income', 'recette'])
            ->whereBetween('transaction_date', [$start, $end])->sum('amount');
        $depenses = Transaction::whereIn('type', ['expense', 'depense'])
            ->whereBetween('transaction_date', [$start, $end])->sum('amount');

        $resultat = $recettes - $depenses;
        $marge = $ca > 0 ? ($resultat / $ca) * 100 : 0;

        // Series for charting depending on period
        $series = [];
        if ($period === 'day') {
            // hourly CA for the day
            $hours = [];
            for ($h = 0; $h < 24; $h++) { $hours[$h] = 0; }
            $rows = DB::table('documents')
                ->selectRaw('HOUR(document_date) as hour, SUM(total) as total')
                ->where('type', 'invoice')->whereIn('status', ['paid', 'facturee'])
                ->whereDate('document_date', $start)
                ->groupBy('hour')
                ->get();
            foreach ($rows as $r) { $hours[(int)$r->hour] = (float)$r->total; }
            $series = array_values($hours);
        } elseif ($period === 'month') {
            // daily CA for the month
            $startC = Carbon::parse($start);
            $daysInMonth = $startC->daysInMonth;
            $days = array_fill(1, $daysInMonth, 0);
            $rows = DB::table('documents')
                ->selectRaw('DAY(document_date) as day, SUM(total) as total')
                ->where('type', 'invoice')->whereIn('status', ['paid', 'facturee'])
                ->whereBetween('document_date', [$start, $end])
                ->groupBy('day')
                ->get();
            foreach ($rows as $r) { $days[(int)$r->day] = (float)$r->total; }
            $series = array_values($days);
        } else {
            // monthly CA for the year
            $monthlyCA = Document::where('type', 'invoice')
                ->whereIn('status', ['paid', 'facturee'])
                ->whereBetween('document_date', [$start, $end])
                ->selectRaw('MONTH(document_date) as month, SUM(total) as total')
                ->groupBy('month')
                ->orderBy('month')
                ->get()
                ->pluck('total', 'month')
                ->toArray();
            $monthlyData = [];
            for ($m = 1; $m <= 12; $m++) { $monthlyData[] = $monthlyCA[$m] ?? 0; }
            $series = $monthlyData;
        }

        // Top articles sold in range
        $topArticles = DB::table('document_items')
            ->join('articles', 'document_items.article_id', '=', 'articles.id')
            ->join('documents', 'document_items.document_id', '=', 'documents.id')
            ->where('documents.type', 'invoice')
            ->whereIn('documents.status', ['paid', 'facturee'])
            ->whereBetween('documents.document_date', [$start, $end])
            ->select('articles.name', DB::raw('SUM(document_items.quantity) as total_quantity'))
            ->groupBy('articles.id', 'articles.name')
            ->orderByDesc('total_quantity')
            ->limit(5)
            ->get();

        return response()->json([
            'chiffre_affaires' => round($ca, 2),
            'recettes' => round($recettes, 2),
            'depenses' => round($depenses, 2),
            'resultat' => round($resultat, 2),
            'marge_percent' => round($marge, 2),
            'series' => $series,
            'top_articles' => $topArticles,
            'period' => $period,
            'start' => $start,
            'end' => $end,
        ]);
    }

    public function caByPeriod(Request $request)
    {
        $start = $request->query('start');
        $end = $request->query('end');

        $query = Document::where('type', 'invoice')->whereIn('status', ['paid', 'facturee']);
        if ($start) $query->whereDate('document_date', '>=', $start);
        if ($end) $query->whereDate('document_date', '<=', $end);

        $total = $query->sum('total');

        return response()->json(['ca' => round($total, 2), 'start' => $start, 'end' => $end]);
    }

    public function exportPdf(Request $request)
    {
        $year = $request->get('year', date('Y'));
        $data = $this->index(new Request(['year' => $year]))->getData(true);

        if (class_exists('\Barryvdh\DomPDF\Facade\Pdf')) {
            try {
                $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.dashboard', $data);
                return $pdf->stream('dashboard_'.$year.'.pdf');
            } catch (\Throwable $e) {
                return response()->json(['error' => 'PDF generation failed', 'detail' => $e->getMessage()], 500);
            }
        }

        if (view()->exists('pdf.dashboard')) {
            return response()->view('pdf.dashboard', $data);
        }

        return response()->json(['message' => 'PDF renderer not available'], 501);
    }
}
