<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('documents', 'payment_status')) {
            return;
        }

        DB::statement("ALTER TABLE documents MODIFY payment_status ENUM('unpaid','advance','partial','paid') NOT NULL DEFAULT 'unpaid'");
    }

    public function down(): void
    {
        if (! Schema::hasColumn('documents', 'payment_status')) {
            return;
        }

        DB::table('documents')->where('payment_status', 'partial')->update(['payment_status' => 'advance']);
        DB::statement("ALTER TABLE documents MODIFY payment_status ENUM('unpaid','advance','paid') NOT NULL DEFAULT 'unpaid'");
    }
};
