<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;
use App\Models\User;

class PermissionSeeder extends Seeder
{
    public function run()
    {
        // Permissions
        $permissions = [
            'view_dashboard',
            'manage_companies', 'view_companies', 'create_companies', 'edit_companies', 'delete_companies',
            'manage_contacts', 'view_contacts', 'create_contacts', 'edit_contacts', 'delete_contacts',
            'manage_articles', 'view_articles', 'create_articles', 'edit_articles', 'delete_articles',
            'manage_documents', 'view_documents', 'create_documents', 'edit_documents', 'delete_documents', 'validate_documents', 'convert_documents',
            'manage_transactions', 'view_transactions', 'create_transactions', 'edit_transactions', 'delete_transactions',
            'manage_cheques', 'view_cheques', 'create_cheques', 'edit_cheques', 'delete_cheques',
            'manage_bank_accounts',
            'manage_reconciliations',
            'manage_users', 'view_users', 'create_users', 'edit_users', 'delete_users',
            'view_reports',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'api']);
        }

        // Rôle Admin (tous droits)
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'api']);
        $adminRole->permissions()->sync(Permission::all());

        // Rôle Employee (droits limités)
        $employeeRole = Role::firstOrCreate(['name' => 'employee', 'guard_name' => 'api']);
        $employeePermissions = [
            'view_dashboard',
            'view_companies', 'view_contacts',
            'view_articles',
            'view_documents', 'create_documents', 'edit_documents', 'validate_documents', 'convert_documents',
            'view_transactions', 'create_transactions',
            'view_cheques',
        ];
        $employeeRole->permissions()->sync(Permission::whereIn('name', $employeePermissions)->get());

        // Assigner le rôle admin à l'utilisateur admin@inoxproline.com (existant)
        $users = User::whereIn('email', [
            'admin@inoxproline.com',
            'hassan@inoxproline.com',
        ])->get();

        foreach ($users as $user) {
            $user->roles()->sync([$adminRole->id]);
        }
    }
}
