<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        User::withoutEvents(function () {
            
            
            User::updateOrCreate(
                ['email' => 'hassan@inoxproline.com'],
                [
                    'first_name' => 'hassan',
                    'last_name' => 'inoxproline',
                    'name' => 'hassan inoxproline',
                    'password' => Hash::make('password'),
                    'phone' => '0612345678',
                    'role' => 'admin', 
                    'is_active' => true,
                ]
            );

            
            
        });
    }
}
