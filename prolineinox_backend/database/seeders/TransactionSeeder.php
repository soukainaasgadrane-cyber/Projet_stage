<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Transaction;
use App\Models\Document;
use App\Models\BankAccount;

class TransactionSeeder extends Seeder
{
    public function run()
    {
        $invoice = Document::where('reference', 'FAC000001')->first();
        $bankAccount = BankAccount::where('account_number', 'PRO-001')->first();

        if ($invoice && $bankAccount) {
            Transaction::updateOrCreate([
                'bank_account_id' => $bankAccount->id,
                'description' => 'Paiement facture FAC000001',
            ], [
                'type' => 'in',
                'amount' => 11050,
                'transaction_date' => '2026-02-20',
                'description' => 'Paiement facture FAC000001',
            ]);
        }
    }
}
