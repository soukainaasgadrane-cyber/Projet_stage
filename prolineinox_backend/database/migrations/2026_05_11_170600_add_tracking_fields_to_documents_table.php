<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            if (! Schema::hasColumn('documents', 'delivery_status')) {
                $table->enum('delivery_status', ['pending', 'in_progress', 'delivered', 'partial'])
                    ->default('pending')
                    ->after('status');
            }

            if (! Schema::hasColumn('documents', 'payment_status')) {
                $table->enum('payment_status', ['unpaid', 'advance', 'paid'])
                    ->default('unpaid')
                    ->after('delivery_status');
            }

            if (! Schema::hasColumn('documents', 'advance_amount')) {
                $table->decimal('advance_amount', 12, 2)
                    ->default(0)
                    ->after('payment_status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            if (Schema::hasColumn('documents', 'advance_amount')) {
                $table->dropColumn('advance_amount');
            }
            if (Schema::hasColumn('documents', 'payment_status')) {
                $table->dropColumn('payment_status');
            }
            if (Schema::hasColumn('documents', 'delivery_status')) {
                $table->dropColumn('delivery_status');
            }
        });
    }
};
