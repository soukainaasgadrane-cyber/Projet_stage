<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Company;
use App\Models\Document;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    public function dashboard()
    {
        $orders = Document::where('type', 'order');

        return response()->json([
            'commercials' => $this->commercialsQuery()->count(),
            'clients' => Company::count(),
            'orders' => (clone $orders)->count(),
            'orders_done' => (clone $orders)->whereIn('status', ['livree', 'facturee', 'validee'])->count(),
            'orders_pending' => (clone $orders)->whereIn('status', ['brouillon', 'acceptee', 'partielle'])->count(),
            'quotes' => Document::where('type', 'quote')->count(),
            'recent_activities' => $this->activitiesQuery()->limit(8)->get()->map(fn ($log) => $this->formatActivity($log)),
            'notifications' => $this->activitiesQuery()->limit(6)->get()->map(fn ($log) => $this->formatActivity($log)),
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

        return response()->json(
            $query
                ->orderBy('name')
                ->get(['id', 'first_name', 'last_name', 'name', 'email', 'role', 'is_active', 'last_login_at', 'created_at'])
        );
    }

    public function activate(User $user)
    {
        $user->update(['is_active' => true]);
        $this->log('Activation commercial', $user);

        return response()->json($user->fresh(['roles']));
    }

    public function block(User $user)
    {
        $user->tokens()->delete();
        $user->update(['is_active' => false]);
        $this->log('Blocage commercial', $user);

        return response()->json($user->fresh(['roles']));
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

    public function activities()
    {
        return response()->json(
            $this->activitiesQuery()
                ->paginate(50)
                ->through(fn ($log) => $this->formatActivity($log))
        );
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
        $period = $request->get('period', 'month');
        $start = $period === 'day' ? now()->startOfDay() : now()->startOfMonth();

        $topCommercials = Document::query()
            ->selectRaw('created_by, COUNT(*) as total')
            ->with('creator:id,name,email')
            ->where('type', 'order')
            ->whereNotNull('created_by')
            ->where('created_at', '>=', $start)
            ->groupBy('created_by')
            ->orderByDesc('total')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'commercial' => $row->creator?->name ?: 'Inconnu',
                'total' => $row->total,
            ]);

        $ordersByMonth = Document::query()
            ->selectRaw('MONTH(created_at) as month, COUNT(*) as total')
            ->where('type', 'order')
            ->whereYear('created_at', now()->year)
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'period' => $period,
            'orders' => Document::where('type', 'order')->where('created_at', '>=', $start)->count(),
            'quotes' => Document::where('type', 'quote')->where('created_at', '>=', $start)->count(),
            'new_clients' => Company::where('created_at', '>=', $start)->count(),
            'top_commercials' => $topCommercials,
            'orders_by_month' => $ordersByMonth,
        ]);
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
        return [
            'id' => $log->id,
            'commercial' => $log->user?->name ?: $log->user?->email ?: 'Systeme',
            'action' => $this->humanAction($log->action),
            'raw_action' => $log->action,
            'date' => $log->created_at?->format('d/m/Y H:i'),
        ];
    }

    private function humanAction(?string $action): string
    {
        return match ($action) {
            'login' => 'Login',
            'logout' => 'Logout',
            'created_quote' => "Creation d'un devis",
            'created_order' => 'Nouvelle commande',
            'created_delivery_note' => 'Nouveau bon de livraison',
            'created_invoice' => 'Nouvelle facture',
            default => $action ?: 'Action',
        };
    }

    private function log(string $action, User $commercial): void
    {
        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'model_type' => User::class,
            'model_id' => $commercial->id,
            'old_values' => null,
            'new_values' => ['commercial_id' => $commercial->id],
            'ip_address' => request()->ip(),
        ]);
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
