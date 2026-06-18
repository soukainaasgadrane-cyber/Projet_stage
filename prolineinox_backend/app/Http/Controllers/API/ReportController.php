<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Contact;
use App\Models\Document;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    // Rapport CRM : nombre de sociétés, contacts, activités récentes
    public function crmStats()
    {
        $companiesCount = Company::count();
        $contactsCount = Contact::count();

        $recentCompanies = Company::latest()->take(5)->get(['id', 'name', 'created_at']);
        $recentContacts = Contact::with('company')->latest()->take(5)->get(['id', 'first_name', 'last_name', 'company_id', 'created_at']);

        // Nouveaux clients
        $newClients7 = Company::where('created_at', '>=', Carbon::now()->subDays(7))->count();
        $newClients30 = Company::where('created_at', '>=', Carbon::now()->subDays(30))->count();

        // Activité commerciale : top clients (documents count) sur 30 jours
        $since = Carbon::now()->subDays(30)->toDateString();
        $topActiveClients = Document::where('document_date', '>=', $since)
            ->groupBy('company_id')
            ->select('company_id', DB::raw('COUNT(*) as docs_count'), DB::raw('SUM(total) as total_amount'))
            ->orderByDesc('docs_count')
            ->limit(10)
            ->get()
            ->map(function ($row) {
                $company = Company::find($row->company_id);
                return [
                    'company_id' => $row->company_id,
                    'company_name' => $company->name ?? null,
                    'documents_count' => (int)$row->docs_count,
                    'total_amount' => (float)$row->total_amount,
                ];
            });

        // Récents documents / activités pour suivi client
        $recentActivities = Document::with('company')->latest()->take(10)->get(['id','reference','type','company_id','status','created_at']);

        return response()->json([
            'companies_count' => $companiesCount,
            'contacts_count' => $contactsCount,
            'recent_companies' => $recentCompanies,
            'recent_contacts' => $recentContacts,
            'new_clients_7d' => $newClients7,
            'new_clients_30d' => $newClients30,
            'top_active_clients' => $topActiveClients,
            'recent_activities' => $recentActivities,
        ]);
    }

    // Rapport ventes : CA par mois, par client, top articles
    public function salesReport(Request $request)
    {
        $year = $request->get('year', date('Y'));

        // CA mensuel
        $monthlyCA = Document::where('type', 'invoice')
            ->whereIn('status', ['paid', 'facturee'])
            ->whereYear('document_date', $year)
            ->selectRaw('MONTH(document_date) as month, SUM(total) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->pluck('total', 'month')
            ->toArray();

        for ($i = 1; $i <= 12; $i++) {
            $monthlyData[$i] = $monthlyCA[$i] ?? 0;
        }

        // CA par client (top 10)
        $topClients = Document::where('type', 'invoice')
            ->whereIn('status', ['paid', 'facturee'])
            ->whereYear('document_date', $year)
            ->join('companies', 'documents.company_id', '=', 'companies.id')
            ->select('companies.name', DB::raw('SUM(documents.total) as total_ca'))
            ->groupBy('companies.id', 'companies.name')
            ->orderByDesc('total_ca')
            ->limit(10)
            ->get();

        // Top articles vendus (quantité)
        $topArticles = DB::table('document_items')
            ->join('documents', 'document_items.document_id', '=', 'documents.id')
            ->join('articles', 'document_items.article_id', '=', 'articles.id')
            ->where('documents.type', 'invoice')
            ->whereIn('documents.status', ['paid', 'facturee'])
            ->whereYear('documents.document_date', $year)
            ->select('articles.name', DB::raw('SUM(document_items.quantity) as total_quantity'))
            ->groupBy('articles.id', 'articles.name')
            ->orderByDesc('total_quantity')
            ->limit(5)
            ->get();

        return response()->json([
            'monthly_ca' => $monthlyData,
            'top_clients' => $topClients,
            'top_articles' => $topArticles,
            'year' => $year,
        ]);
    }

    // Rapport achats
    public function purchaseReport(Request $request)
    {
        $year = $request->get('year', date('Y'));

        // Achats par mois (factures fournisseur)
        $monthlyPurchases = Document::where('type', 'supplier_invoice')
            ->whereIn('status', ['paid', 'facturee'])
            ->whereYear('document_date', $year)
            ->selectRaw('MONTH(document_date) as month, SUM(total) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->pluck('total', 'month')
            ->toArray();

        for ($i = 1; $i <= 12; $i++) {
            $monthlyData[$i] = $monthlyPurchases[$i] ?? 0;
        }

        // Top fournisseurs
        $topSuppliers = Document::where('type', 'supplier_invoice')
            ->whereIn('status', ['paid', 'facturee'])
            ->whereYear('document_date', $year)
            ->join('companies', 'documents.company_id', '=', 'companies.id')
            ->select('companies.name', DB::raw('SUM(documents.total) as total_achats'))
            ->groupBy('companies.id', 'companies.name')
            ->orderByDesc('total_achats')
            ->limit(10)
            ->get();

        return response()->json([
            'monthly_purchases' => $monthlyData,
            'top_suppliers' => $topSuppliers,
            'year' => $year,
        ]);
    }

    // Historique mixte (CRM + documents + transactions)
    public function history()
    {
        $recentCompanies = Company::latest()->take(10)->get(['id','name','created_at']);
        $recentContacts = Contact::with('company')->latest()->take(10)->get(['id','first_name','last_name','company_id','created_at']);
        $recentDocuments = Document::latest()->take(10)->get(['id','reference','type','company_id','created_at']);
        $recentTransactions = Transaction::latest()->take(10)->get(['id','amount','transaction_date','transactionable_type','transactionable_id']);

        return response()->json([
            'companies' => $recentCompanies,
            'contacts' => $recentContacts,
            'documents' => $recentDocuments,
            'transactions' => $recentTransactions,
        ]);
    }
}
