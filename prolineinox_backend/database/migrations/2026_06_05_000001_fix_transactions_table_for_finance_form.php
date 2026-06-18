<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('transactions')) {
            return;
        }

        Schema::table('transactions', function (Blueprint $table) {
            if (!Schema::hasColumn('transactions', 'payment_method')) {
                $table->string('payment_method')->default('virement')->after('transaction_date');
            }

            if (!Schema::hasColumn('transactions', 'reference')) {
                $table->string('reference')->nullable()->after('payment_method');
            }

            if (!Schema::hasColumn('transactions', 'transactionable_type')) {
                $table->string('transactionable_type')->nullable()->after('bank_account_id');
            }

            if (!Schema::hasColumn('transactions', 'transactionable_id')) {
                $table->unsignedBigInteger('transactionable_id')->nullable()->after('transactionable_type');
            }
        });

        DB::statement("ALTER TABLE transactions MODIFY type ENUM('in', 'out', 'income', 'expense') NOT NULL");
        DB::statement("UPDATE transactions SET type = 'income' WHERE type = 'in'");
        DB::statement("UPDATE transactions SET type = 'expense' WHERE type = 'out'");
        DB::statement("ALTER TABLE transactions MODIFY type ENUM('income', 'expense') NOT NULL");
        DB::statement('ALTER TABLE transactions MODIFY bank_account_id BIGINT UNSIGNED NULL');
    }

    public function down()
    {
        if (!Schema::hasTable('transactions')) {
            return;
        }

        DB::statement("UPDATE transactions SET type = 'in' WHERE type = 'income'");
        DB::statement("UPDATE transactions SET type = 'out' WHERE type = 'expense'");
        DB::statement("ALTER TABLE transactions MODIFY type ENUM('in', 'out') NOT NULL");
        DB::statement('ALTER TABLE transactions MODIFY bank_account_id BIGINT UNSIGNED NOT NULL');

        Schema::table('transactions', function (Blueprint $table) {
            if (Schema::hasColumn('transactions', 'transactionable_id')) {
                $table->dropColumn('transactionable_id');
            }

            if (Schema::hasColumn('transactions', 'transactionable_type')) {
                $table->dropColumn('transactionable_type');
            }

            if (Schema::hasColumn('transactions', 'reference')) {
                $table->dropColumn('reference');
            }

            if (Schema::hasColumn('transactions', 'payment_method')) {
                $table->dropColumn('payment_method');
            }
        });
    }
};
