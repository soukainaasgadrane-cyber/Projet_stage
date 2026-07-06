<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        User::withoutEvents(function () {
            $admin = User::updateOrCreate(
                ['email' => 'hassan@inoxproline.com'],
                [
                    'first_name' => 'hassan',
                    'last_name' => 'inoxproline',
                    'name' => 'hassan inoxproline',
                    'password' => Hash::make('Admin@2026'),
                    'phone' => '0612345678',
                    'role' => 'admin',
                    'is_active' => true,
                ]
            );

            $commercial = User::updateOrCreate(
                ['email' => 'commercial@inoxproline.com'],
                [
                    'first_name' => 'Commercial',
                    'last_name' => 'InoxProline',
                    'name' => 'Commercial InoxProline',
                    'password' => Hash::make('Inoxproline@2026'),
                    'phone' => '0600000000',
                    'role' => 'employee',
                    'is_active' => true,
                ]
            );

            if (class_exists(Role::class)) {
                $adminRole = Role::firstOrCreate(['name' => 'admin']);
                $employeeRole = Role::firstOrCreate(['name' => 'employee']);

                $admin->roles()->syncWithoutDetaching([$adminRole->id]);
                $commercial->roles()->syncWithoutDetaching([$employeeRole->id]);
            }
        });
    }
}
