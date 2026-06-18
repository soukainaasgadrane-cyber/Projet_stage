<?php

namespace Database\Seeders;

use App\Models\BankAccount;
use Illuminate\Database\Seeder;

class BankAccountSeeder extends Seeder
{
    public function run()
    {
        BankAccount::updateOrCreate([
            'account_number' => 'PRO-001',
        ], [
            'name' => 'Compte principal',
            'account_number' => 'PRO-001',
            'balance' => 11050,
        ]);
    }
}
