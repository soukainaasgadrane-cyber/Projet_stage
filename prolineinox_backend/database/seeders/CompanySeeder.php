<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;

class CompanySeeder extends Seeder
{
    public function run()
    {
        Company::updateOrCreate([
            'email' => 'contact@client.ma'
        ], [
            'name' => 'Client SARL',
            'email' => 'contact@client.ma',
            'phone' => '0522223344',
            'address' => '123 Rue Mohammed V',
            'city' => 'Casablanca',
            'country' => 'Maroc',
            'tax_number' => '12345678',
        ]);
    }
}
