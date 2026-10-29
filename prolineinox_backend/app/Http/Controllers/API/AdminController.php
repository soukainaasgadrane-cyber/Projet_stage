<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Company;
use App\Models\Document;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    public function dashboard()
    {
        $orders = Document::where('type', 'order');
        $invoices = Document::where('type', 'invoice')->whereNotIn('status', ['cancelled', 'annulee']);
        $startMonth = now()->startOfMonth()->subMonths(5);
        $salesByMonth = collect(range(0, 5))->map(function ($offset) use ($startMonth) {
            $month = $startMonth->copy()->addMonths($offset);
            return [
                'month' => $month->format('Y-m'),
                'sales' => (float) Document::where('type', 'invoice')->whereYear('document_date', $month->year)->whereMonth('document_date', $month->month)->whereNotIn('status', ['cancelled', 'annulee'])->sum('total'),
                'collected' => (float) Transaction::where('type', 'income')->whereYear('transaction_date', $month->year)->whereMonth('transaction_date', $month->month)->sum('amount'),
            ];
        });
        $expiringQuotes = Document::with('company')->where('type', 'quote')->whereNotIn('status', ['approved', 'acceptee', 'cancelled', 'annulee'])->whereBetween('due_date', [today(), today()->addDays(7)])->orderBy('due_date')->limit(8)->get();
        $overdueOrders = Document::with('company')->where('type', 'order')->whereNotIn('status', ['delivered', 'livree', 'invoiced', 'facturee', 'cancelled', 'annulee'])->whereDate('due_date', '<', today())->orderBy('due_date')->limit(8)->get();
        $overdueInvoices = Document::with('company')->where('type', 'invoice')->whereIn('payment_status', ['unpaid', 'partial', 'advance'])->whereDate('due_date', '<', today())->orderBy('due_date')->limit(8)->get();
        $activityItems = $this->activitiesQuery()->limit(8)->get()->map(fn ($log) => $this->formatActivity($log));

        return response()->json([
            'commercials' => $this->commercialsQuery()->count(),
            'commercials_active' => $this->commercialsQuery()->where('account_status', 'active')->where('is_active', true)->count(),
            'commercials_suspended' => $this->commercialsQuery()->where('account_status', 'suspended')->count(),
            'commercials_blocked' => $this->commercialsQuery()->where(function ($query) {
                $query->where('account_status', 'blocked')->orWhere(function ($query) {
                    $query->whereNull('account_status')->where('is_active', false);
                });
            })->count(),
            'clients' => Company::count(),
            'orders' => (clone $orders)->count(),
            'orders_done' => (clone $orders)->whereIn('status', ['livree', 'delivered', 'facturee', 'invoiced', 'validee', 'paid'])->count(),
            'orders_pending' => (clone $orders)->whereNotIn('status', ['livree', 'delivered', 'facturee', 'invoiced', 'paid', 'cancelled', 'annulee'])->count(),
            'quotes' => Document::where('type', 'quote')->count(),
            'invoices' => (clone $invoices)->count(),
            'revenue' => (float) (clone $invoices)->sum('total'),
            'collected' => (float) Transaction::where('type', 'income')->sum('amount'),
            'sales_by_month' => $salesByMonth,
            'recent_activities' => $activityItems,
            'alerts' => [
                'expiring_quotes' => $expiringQuotes->map(fn ($document) => $this->formatDocumentAlert($document, 'Devis proche de l’expiration')),
                'overdue_orders' => $overdueOrders->map(fn ($document) => $this->formatDocumentAlert($document, 'Commande en retard')),
                'overdue_invoices' => $overdueInvoices->map(fn ($document) => $this->formatDocumentAlert($document, 'Facture impayée et échue')),
            ],
        ]);
    }

    public function commercials(Request $request)
    {
        $query = $this->commercialsQuery();
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('account_status', $request->string('status')->toString());
        }

        $query->withCount([
            'documents as quotes_count' => fn ($documents) => $documents->where('type', 'quote'),
            'documents as orders_count' => fn ($documents) => $documents->where('type', 'order'),
            'documents as converted_quotes_count' => fn ($documents) => $documents->where('type', 'quote')->whereExists(function ($child) {
                $child->selectRaw('1')->from('documents as child_documents')->whereColumn('child_documents.parent_document_id', 'documents.id')->where('child_documents.type', 'order');
            }),
        ]);
        $commercials = $query->orderBy('name')->paginate(20);
        $commercials->getCollection()->transform(function (User $user) {
            $user->account_status = $user->account_status ?: ($user->is_active ? 'active' : 'blocked');
            $user->conversion_rate = $user->quotes_count > 0 ? round(($user->converted_quotes_count / $user->quotes_count) * 100, 1) : 0;
            return $user;
        });

        return response()->json($commercials);
    }

    public function activate(User $user)
    {
        return $this->setCommercialStatus($user, 'active', null);
    }

    public function suspend(Request $request, User $user)
    {
        $data = $request->validate(['reason' => ['required', 'string', 'max:1000']]);
        return $this->setCommercialStatus($user, 'suspended', $data['reason']);
    }

    public function block(Request $request, User $user)
    {
        $data = $request->validate(['reason' => ['required', 'string', 'max:1000']]);
        return $this->setCommercialStatus($user, 'blocked', $data['reason']);
    }

    public function clients(Request $request)
    {
        $query = Company::withCount('documents')->orderBy('name');
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%");
            });
        }

        return response()->json($query->paginate(25));
    }

    public function quotes(Request $request)
    {
        $query = Document::with(['company', 'creator'])
            ->where('type', 'quote')
            ->orderByDesc('id');
        $this->applyDocumentFilters($query, $request);

        return response()->json(
            $query->paginate(25)
        );
    }

    public function orders(Request $request)
    {
        $query = Document::with(['company', 'creator'])
            ->where('type', 'order')
            ->orderByDesc('id');
        $this->applyDocumentFilters($query, $request);

        return response()->json(
            $query->paginate(25)
        );
    }

    public function invoices(Request $request)
    {
        $query = Document::with(['company', 'creator'])
            ->where('type', 'invoice')
            ->orderByDesc('id');
        $this->applyDocumentFilters($query, $request);
        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        return response()->json($query->paginate(25));
    }

    public function payments(Request $request)
    {
        $query = Transaction::with(['transactionable.company', 'transactionable.creator'])
            ->where('type', 'income')
            ->orderByDesc('transaction_date');
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($filter) use ($search) {
                $filter->where('reference', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }
        if ($request->filled('date_from')) $query->whereDate('transaction_date', '>=', $request->date_from);
        if ($request->filled('date_to')) $query->whereDate('transaction_date', '<=', $request->date_to);

        return response()->json($query->paginate(25));
    }

    public function activities(Request $request)
    {
        $query = $this->activitiesQuery();
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($filter) use ($search) {
                $filter->where('action', 'like', "%{$search}%")
                    ->orWhere('model_type', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($user) => $user->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
            });
        }
        if ($request->filled('date_from')) $query->whereDate('created_at', '>=', $request->date_from);
        if ($request->filled('date_to')) $query->whereDate('created_at', '<=', $request->date_to);

        return response()->json($query->paginate(50)->through(fn ($log) => $this->formatActivity($log)));
    }

    public function notifications()
    {
        return response()->json(
            $this->activitiesQuery()
                ->limit(20)
                ->get()
                ->map(fn ($log) => $this->formatActivity($log))
        );
    }

    public function reports(Request $request)
    {
        [$start, $end] = $this->reportRange($request);
        $documentPeriod = fn ($query) => $query->whereBetween('document_date', [$start->toDateString(), $end->toDateString()]);

        $topCommercials = Document::query()
            ->selectRaw('created_by, COUNT(*) as total')
            ->with('creator:id,name,email')
            ->where('type', 'order')
            ->whereNotNull('created_by')
            ->whereBetween('document_date', [$start->toDateString(), $end->toDateString()])
            ->groupBy('created_by')
            ->orderByDesc('total')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'commercial' => $row->creator?->name ?: 'Inconnu',
                'total' => $row->total,
            ]);

        $performance = $this->commercialsQuery()->withCount([
            'documents as quotes_count' => fn ($query) => $query->where('type', 'quote')->whereBetween('document_date', [$start->toDateString(), $end->toDateString()]),
            'documents as orders_count' => fn ($query) => $query->where('type', 'order')->whereBetween('document_date', [$start->toDateString(), $end->toDateString()]),
            'documents as converted_quotes_count' => fn ($query) => $query->where('type', 'quote')->whereBetween('document_date', [$start->toDateString(), $end->toDateString()])->whereExists(function ($child) {
                $child->selectRaw('1')->from('documents as child_documents')->whereColumn('child_documents.parent_document_id', 'documents.id')->where('child_documents.type', 'order');
            }),
        ])->get(['id', 'name', 'first_name', 'last_name'])->map(function (User $user) {
            $user->name = $user->name ?: trim($user->first_name.' '.$user->last_name);
            $user->conversion_rate = $user->quotes_count > 0 ? round(($user->converted_quotes_count / $user->quotes_count) * 100, 1) : 0;
            return $user;
        })->sortByDesc('orders_count')->values();

        $monthCursor = $start->copy()->startOfMonth();
        $ordersByMonth = collect();
        while ($monthCursor->lte($end)) {
            $ordersByMonth->push([
                'month' => $monthCursor->format('Y-m'),
                'orders' => Document::where('type', 'order')->whereYear('document_date', $monthCursor->year)->whereMonth('document_date', $monthCursor->month)->whereBetween('document_date', [$start->toDateString(), $end->toDateString()])->count(),
                'quotes' => Document::where('type', 'quote')->whereYear('document_date', $monthCursor->year)->whereMonth('document_date', $monthCursor->month)->whereBetween('document_date', [$start->toDateString(), $end->toDateString()])->count(),
            ]);
            $monthCursor->addMonth();
        }

        return response()->json([
            'start' => $start->toDateString(),
            'end' => $end->toDateString(),
            'orders' => $documentPeriod(Document::where('type', 'order'))->count(),
            'quotes' => $documentPeriod(Document::where('type', 'quote'))->count(),
            'new_clients' => Company::whereBetween('created_at', [$start, $end->copy()->endOfDay()])->count(),
            'invoices' => $documentPeriod(Document::where('type', 'invoice'))->count(),
            'revenue' => (float) $documentPeriod(Document::where('type', 'invoice')->whereNotIn('status', ['cancelled', 'annulee']))->sum('total'),
            'collected' => (float) Transaction::where('type', 'income')->whereBetween('transaction_date', [$start->toDateString(), $end->toDateString()])->sum('amount'),
            'top_commercials' => $topCommercials,
            'performance' => $performance,
            'orders_by_month' => $ordersByMonth,
        ]);
    }

    public function exportReports(Request $request)
    {
        $report = $this->reports($request)->getData(true);
        $format = $request->get('format', 'csv');
        if ($format === 'pdf' && class_exists('\Barryvdh\DomPDF\Facade\Pdf')) {
            return \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.admin-report', ['report' => $report])
                ->setPaper('A4', 'landscape')
                ->download('rapport-admin-'.$report['start'].'-'.$report['end'].'.pdf');
        }

        if (! in_array($format, ['csv', 'excel', 'xlsx'])) {
            abort(422, 'Format non pris en charge. Utilisez CSV ou PDF.');
        }

        return response()->streamDownload(function () use ($report) {
            $output = fopen('php://output', 'w');
            fwrite($output, "\xEF\xBB\xBF");
            fputcsv($output, ['Rapport Admin', $report['start'].' - '.$report['end']], ';');
            fputcsv($output, ['Devis', $report['quotes'], 'Commandes', $report['orders'], 'Factures', $report['invoices']], ';');
            fputcsv($output, ['Chiffre d’affaires facturé (MAD)', $report['revenue'], 'Paiements encaissés (MAD)', $report['collected']], ';');
            fputcsv($output, [], ';');
            fputcsv($output, ['Commercial', 'Devis', 'Commandes', 'Conversion commandes/devis (%)'], ';');
            foreach ($report['performance'] as $commercial) {
                fputcsv($output, [$commercial['name'], $commercial['quotes_count'], $commercial['orders_count'], $commercial['conversion_rate']], ';');
            }
            fclose($output);
        }, 'rapport-admin-'.$report['start'].'-'.$report['end'].'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    public function profile(Request $request)
    {
        return response()->json($request->user()->load('roles'));
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'first_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['nullable', 'string', 'max:100'],
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email:rfc', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['nullable', 'string', 'min:8'],
        ]);

        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
            $user->tokens()->delete();
        } else {
            unset($data['password']);
        }

        if (empty($data['name'])) {
            $data['name'] = trim(($data['first_name'] ?? $user->first_name).' '.($data['last_name'] ?? $user->last_name));
        }

        $user->update($data);

        return response()->json($user->fresh(['roles']));
    }

    private function setCommercialStatus(User $user, string $status, ?string $reason)
    {
        $user = $this->commercialsQuery()->findOrFail($user->id);
        $previousStatus = $user->account_status ?: ($user->is_active ? 'active' : 'blocked');
        $user->forceFill([
            'account_status' => $status,
            'account_status_reason' => $status === 'active' ? null : $reason,
            'is_active' => $status === 'active',
        ])->saveQuietly();

        if ($status !== 'active') {
            $user->tokens()->delete();
        }

        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'commercial_'.$status,
            'model_type' => User::class,
            'model_id' => $user->id,
            'old_values' => ['account_status' => $previousStatus],
            'new_values' => ['account_status' => $status, 'reason' => $reason],
            'ip_address' => request()->ip(),
        ]);

        return response()->json($user->fresh(['roles']));
    }

    private function reportRange(Request $request): array
    {
        $data = $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'period' => ['nullable', 'in:day,month,year,custom'],
        ]);

        if (! empty($data['date_from']) || ! empty($data['date_to'])) {
            $start = Carbon::parse($data['date_from'] ?? $data['date_to'])->startOfDay();
            $end = Carbon::parse($data['date_to'] ?? $data['date_from'])->endOfDay();
            return [$start, $end];
        }

        $period = $data['period'] ?? 'month';
        $start = match ($period) {
            'day' => now()->startOfDay(),
            'year' => now()->startOfYear(),
            default => now()->startOfMonth(),
        };

        return [$start, now()->endOfDay()];
    }

    private function commercialsQuery()
    {
        return User::query()
            ->with('roles')
            ->where(function ($query) {
                $query->whereNull('role')
                    ->orWhere('role', '!=', 'admin');
            })
            ->whereDoesntHave('roles', function ($query) {
                $query->where('name', 'admin');
            });
    }

    private function activitiesQuery()
    {
        return ActivityLog::with('user')->orderByDesc('created_at');
    }

    private function formatActivity(ActivityLog $log): array
    {
        $target = $log->model_type === User::class ? User::find($log->model_id) : null;
        return [
            'id' => $log->id,
            'commercial' => $target?->name ?: $log->user?->name ?: $log->user?->email ?: 'Système',
            'actor' => $log->user?->name ?: $log->user?->email ?: 'Système',
            'reason' => data_get($log->new_values, 'reason'),
            'action' => $this->humanAction($log),
            'raw_action' => $log->action,
            'entity' => class_basename($log->model_type),
            'ip_address' => $log->ip_address,
            'date' => $log->created_at?->format('d/m/Y H:i'),
        ];
    }

    private function formatDocumentAlert(Document $document, string $label): array
    {
        return [
            'id' => $document->id,
            'title' => $label,
            'reference' => $document->reference,
            'client' => $document->company?->name ?: 'Client sans nom',
            'due_date' => $document->due_date?->format('d/m/Y'),
            'amount' => (float) $document->total,
            'status' => $document->status,
        ];
    }

    private function humanAction(ActivityLog $log): string
    {
        $type = data_get($log->new_values, 'type', data_get($log->old_values, 'type'));
        if ($log->model_type === Document::class && in_array($log->action, ['created', 'updated', 'deleted'], true)) {
            $kind = match ($type) {
                'quote' => 'devis',
                'order' => 'commande',
                'invoice' => 'facture',
                default => 'document',
            };
            return match ($log->action) {
                'created' => ucfirst($kind).' créé',
                'updated' => ucfirst($kind).' modifié',
                default => ucfirst($kind).' supprimé',
            };
        }

        return match ($log->action) {
            'login' => 'Login',
            'logout' => 'Logout',
            'created_quote' => "Creation d'un devis",
            'created_order' => 'Nouvelle commande',
            'created_delivery_note' => 'Nouveau bon de livraison',
            'created_invoice' => 'Nouvelle facture',
            'commercial_blocked' => 'Compte commercial bloqué',
            'commercial_suspended' => 'Compte commercial suspendu',
            'commercial_active' => 'Compte commercial réactivé',
            default => $log->action ?: 'Action',
        };
    }

    private function applyDocumentFilters($query, Request $request): void
    {
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%")
                    ->orWhereHas('company', fn ($company) => $company->where('name', 'like', "%{$search}%"));
            });
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('date_from')) {
            $query->whereDate('document_date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('document_date', '<=', $request->date_to);
        }
    }
}
