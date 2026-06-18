<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Article;
use App\Models\Document;
use App\Models\Vente;
use App\Models\Company;
use App\Models\Contact;
use App\Models\Transaction;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $q = $request->query('q');
        $scope = $request->query('scope');

        if (! $q) {
            return response()->json([]);
        }

        $results = [];

        switch ($scope) {
            case 'articles':
                $results = Article::where('name', 'like', "%{$q}%")->limit(50)->get();
                break;
            case 'documents':
                $query = Document::with('company')
                    ->where('reference', 'like', "%{$q}%")
                    ->orWhere('type', 'like', "%{$q}%");
                // search by company name
                $query->orWhereHas('company', function($q2) use ($q) { $q2->where('name', 'like', "%{$q}%"); });
                // search by date if parseable
                try { if (\Carbon\Carbon::hasFormat($q, 'Y-m-d') || strtotime($q)) { $date = \Carbon\Carbon::parse($q)->toDateString(); $query->orWhereDate('document_date', $date); } } catch (\Throwable $e) {}
                // search by amount
                if (is_numeric(str_replace([',',' '], ['','.'], $q))) { $amount = floatval(str_replace([',',' '], ['','.'], $q)); $query->orWhere('total', $amount); }
                $results = $query->limit(50)->get();
                break;
            case 'companies':
                $results = Company::where('name', 'like', "%{$q}%")->limit(50)->get();
                break;
            case 'contacts':
                $results = Contact::where('first_name', 'like', "%{$q}%")->orWhere('last_name', 'like', "%{$q}%")->limit(50)->get();
                break;
            case 'transactions':
                $results = Transaction::where('description', 'like', "%{$q}%")->limit(50)->get();
                break;
            default:
                // Global search: return commonly used keys for frontend search bar
                $results = [
                    'clients' => Company::where('name', 'like', "%{$q}%")->limit(10)->get(),
                    'ventes' => Vente::where('reference', 'like', "%{$q}%")->limit(10)->get(),
                    'produits' => Article::where('name', 'like', "%{$q}%")->limit(10)->get(),
                ];
        }

        return response()->json($results);
    }
}
