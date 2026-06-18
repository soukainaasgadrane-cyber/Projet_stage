<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $this->call([
            UserSeeder::class,
            PermissionSeeder::class,
            CompanySeeder::class,
            CategorySeeder::class,
            ArticleSeeder::class,
            ContactSeeder::class,
            DocumentSeeder::class,
            BankAccountSeeder::class,
            TransactionSeeder::class,
        ]);
    }
}
