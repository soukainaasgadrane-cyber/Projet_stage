<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\API\DocumentController;

class GenerateRecurringInvoices extends Command
{
    protected $signature = 'invoices:generate-recurring';
    protected $description = 'Génère les factures récurrentes échues';

    public function handle()
    {
        DocumentController::generateRecurringInvoices();
        $this->info('Factures récurrentes générées avec succès.');
    }
}