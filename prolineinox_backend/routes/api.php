<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CompanyController;
use App\Http\Controllers\API\ContactController;
use App\Http\Controllers\API\DevisController;
use App\Http\Controllers\API\FactureController;
use App\Http\Controllers\API\VenteController;
use App\Http\Controllers\API\TransactionController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\CollaborateurController;
use App\Http\Controllers\API\PdfController;
use App\Http\Controllers\API\SearchController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\DocumentController;
use App\Http\Controllers\API\ArticleController;
use App\Http\Controllers\API\AuditController;
use App\Http\Controllers\API\AdminController;
use App\Http\Controllers\API\BankAccountController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\CatalogueReportController;
use App\Http\Controllers\API\ChequeController;
use App\Http\Controllers\API\ChequeDepositController;
use App\Http\Controllers\API\FinanceReportController;
use App\Http\Controllers\API\GoodsReceptionController;
use App\Http\Controllers\API\ImportController;
use App\Http\Controllers\API\PurchaseOrderController;
use App\Http\Controllers\API\PurchaseRequestController;
use App\Http\Controllers\API\ReconciliationController;
use App\Http\Controllers\API\RecurringInvoiceSettingController;
use App\Http\Controllers\API\ReportController;
use App\Http\Controllers\API\SupplierCreditNoteController;
use App\Http\Controllers\API\SupplierInvoiceController;
use App\Http\Controllers\API\UserController;
use App\Models\Document;
use App\Models\Grow;
use App\Models\RecurringInvoiceSetting;

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index']);

});

/*
|--------------------------------------------------------------------------
| AUTH ROUTES
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');

Route::middleware(['auth:sanctum', 'throttle:api', 'admin.readonly'])->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    // current user
    Route::get('/user', [AuthController::class, 'user']);

    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('dashboard', [AdminController::class, 'dashboard']);
        Route::get('commercials', [AdminController::class, 'commercials']);
        Route::patch('commercials/{user}/block', [AdminController::class, 'block']);
        Route::patch('commercials/{user}/activate', [AdminController::class, 'activate']);
        Route::get('clients', [AdminController::class, 'clients']);
        Route::get('devis', [AdminController::class, 'quotes']);
        Route::get('commandes', [AdminController::class, 'orders']);
        Route::get('activities', [AdminController::class, 'activities']);
        Route::get('notifications', [AdminController::class, 'notifications']);
        Route::get('reports', [AdminController::class, 'reports']);
        Route::get('profile', [AdminController::class, 'profile']);
        Route::put('profile', [AdminController::class, 'updateProfile']);
    });

    /*
    |--------------------------------------------------------------------------
    | CRM ROUTES
    |--------------------------------------------------------------------------
    */

    Route::apiResource('companies', CompanyController::class);
    Route::get('comptes', [CompanyController::class, 'index']);
    Route::apiResource('contacts', ContactController::class);
    Route::apiResource('users', UserController::class)->middleware('role:admin');

    /*
    |--------------------------------------------------------------------------
    | COMMERCIAL
    |--------------------------------------------------------------------------
    */

    Route::apiResource('devis', DevisController::class);
    Route::get('devis/{devis}/pdf', [DevisController::class, 'generatePdf']);
    Route::apiResource('factures', FactureController::class);
    Route::apiResource('ventes', VenteController::class);
    Route::get('documents/next-reference/{type}', [DocumentController::class, 'nextReference']);
    Route::apiResource('documents', DocumentController::class);
    Route::get('documents/{document}/pdf', [DocumentController::class, 'generatePdf']);
    Route::post('documents/{document}/items', [DocumentController::class, 'addItem']);
    Route::delete('documents/{document}/items/{item}', [DocumentController::class, 'removeItem']);
    Route::post('documents/{document}/convert/{targetType}', [DocumentController::class, 'convert']);
    Route::post('documents/{document}/validate', [DocumentController::class, 'validateDocument']);
    Route::post('documents/{document}/sent', [DocumentController::class, 'markAsSent']);
    Route::post('documents/{document}/approved', [DocumentController::class, 'markAsApproved']);
    Route::post('documents/{document}/partial', [DocumentController::class, 'markAsPartial']);
    Route::post('documents/{document}/paid', [DocumentController::class, 'markAsPaid']);
    Route::post('documents/{document}/cancel', [DocumentController::class, 'cancel']);
    Route::post('documents/{document}/duplicate', [DocumentController::class, 'duplicate']);
    Route::post('documents/{invoice}/credit-note', [DocumentController::class, 'createCreditNote']);
    Route::apiResource('recurring-invoices', RecurringInvoiceSettingController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::apiResource('transactions', TransactionController::class);
    Route::post('articles/{article}/image', [ArticleController::class, 'uploadImage']);
    Route::apiResource('articles', ArticleController::class);
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('purchase-requests', PurchaseRequestController::class);
    Route::apiResource('purchase-orders', PurchaseOrderController::class);
    Route::apiResource('receipts-notes', GoodsReceptionController::class);
    Route::apiResource('supplier-invoices', SupplierInvoiceController::class);
    Route::apiResource('supplier-credit-notes', SupplierCreditNoteController::class);

    /*
    |--------------------------------------------------------------------------
    | STOCK
    |--------------------------------------------------------------------------
    */

    Route::apiResource('products', ProductController::class);
    Route::post('import/articles', [ImportController::class, 'importArticles']);

    /*
    |--------------------------------------------------------------------------
    | RH
    |--------------------------------------------------------------------------
    */

    Route::apiResource('collaborateurs', CollaborateurController::class);
    Route::get('activity-logs', [AuditController::class, 'index']);
    Route::get('grow', function () {
        return response()->json(Grow::with('user')->paginate(20));
    });
    Route::post('grow', function (Request $request) {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'objective' => 'required|string|max:255',
            'target_value' => 'required|numeric|min:0',
            'current_value' => 'nullable|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'nullable|in:active,achieved,failed',
        ]);

        return response()->json(Grow::create($data + ['current_value' => 0, 'status' => 'active'])->load('user'), 201);
    });
    Route::put('grow/{grow}', function (Request $request, Grow $grow) {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'objective' => 'required|string|max:255',
            'target_value' => 'required|numeric|min:0',
            'current_value' => 'nullable|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'nullable|in:active,achieved,failed',
        ]);

        $grow->update($data);
        return response()->json($grow->load('user'));
    });
    Route::delete('grow/{grow}', function (Grow $grow) {
        $grow->delete();
        return response()->json(['message' => 'Deleted']);
    });

    /*
    |--------------------------------------------------------------------------
    | FINANCE MODULE
    |--------------------------------------------------------------------------
    */

    Route::apiResource('bank-accounts', BankAccountController::class);
    Route::get('recouvrement/unpaid', function () {
        return response()->json(Document::with('company')
            ->where('type', 'invoice')
            ->whereNotIn('status', ['paid', 'facturee', 'cancelled', 'annulee'])
            ->orderBy('due_date')
            ->get());
    });
    Route::post('recouvrement/relance/{invoice}', function (Document $invoice) {
        return response()->json(['message' => 'Relance enregistrée', 'invoice_id' => $invoice->id]);
    });
    Route::apiResource('cheques', ChequeController::class);
    Route::patch('cheques/{cheque}/status', [ChequeController::class, 'updateStatus']);
    Route::apiResource('cheque-deposits', ChequeDepositController::class)->only(['index', 'store', 'show', 'destroy']);
    Route::post('cheque-deposits/{chequeDeposit}/approve', [ChequeDepositController::class, 'approve']);
    Route::apiResource('reconciliations', ReconciliationController::class);
    Route::post('reconciliations/{reconciliation}/transactions', [ReconciliationController::class, 'addTransaction']);
    Route::post('reconciliations/{reconciliation}/auto-match', [ReconciliationController::class, 'autoMatch']);

    /*
    |--------------------------------------------------------------------------
    | PDF
    |--------------------------------------------------------------------------
    */

    Route::get('ventes/{id}/pdf', [PdfController::class, 'ventePdf']);

    /*
    |--------------------------------------------------------------------------
    | GLOBAL SEARCH
    |--------------------------------------------------------------------------
    */

    Route::get('search', [SearchController::class, 'search']);

    /*
    |--------------------------------------------------------------------------
    | REPORTS
    |--------------------------------------------------------------------------
    */

    Route::get('reports/crm', [ReportController::class, 'crmStats']);
    Route::get('rapports', [ReportController::class, 'crmStats']);
    Route::get('reports/sales', [ReportController::class, 'salesReport']);
    Route::get('reports/purchases', [ReportController::class, 'purchaseReport']);
    Route::get('reports/history', [ReportController::class, 'history']);
    Route::get('reports/inventory', [CatalogueReportController::class, 'inventory']);
    Route::get('reports/finance', [FinanceReportController::class, 'treasury']);
    Route::get('reports/finance/overview', [FinanceReportController::class, 'overview']);
    Route::get('reports/finance/bank-history', [FinanceReportController::class, 'bankHistory']);
});
