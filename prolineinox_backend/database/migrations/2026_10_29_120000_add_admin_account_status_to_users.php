<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'account_status')) {
                $table->string('account_status', 20)->default('active')->after('is_active');
            }
            if (! Schema::hasColumn('users', 'account_status_reason')) {
                $table->text('account_status_reason')->nullable()->after('account_status');
            }
        });

        DB::table('users')->where('is_active', false)->update(['account_status' => 'blocked']);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columns = array_filter(['account_status', 'account_status_reason'], fn ($column) => Schema::hasColumn('users', $column));
            if ($columns) {
                $table->dropColumn($columns);
            }
        });
    }
};
