<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Contact;
use App\Models\Company;

class ContactSeeder extends Seeder
{
    public function run()
    {
        $company = Company::first();

        if (! $company) {
            return;
        }

        Contact::updateOrCreate([
            'email' => 'karim@client.ma'
        ], [
            'company_id' => $company->id,
            'first_name' => 'Karim',
            'last_name' => 'Alami',
            'email' => 'karim@client.ma',
            'phone' => '0611122233',
            'position' => 'Directeur',
        ]);
    }
}
