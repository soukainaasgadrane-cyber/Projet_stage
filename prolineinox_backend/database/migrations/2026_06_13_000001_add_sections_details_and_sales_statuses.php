<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('document_items', function (Blueprint $table) {
            if (! Schema::hasColumn('document_items', 'line_type')) {
                $table->enum('line_type', ['article', 'section'])->default('article')->after('article_id');
            }

            if (! Schema::hasColumn('document_items', 'details')) {
                $table->text('details')->nullable()->after('description');
            }
        });

        DB::statement("ALTER TABLE documents MODIFY status ENUM('draft','sent','approved','delivered','partial','paid','cancelled','brouillon','validee','acceptee','partielle','livree','expiree','facturee','annulee') NOT NULL DEFAULT 'brouillon'");

        DB::table('documents')->where('status', 'draft')->update(['status' => 'brouillon']);
        DB::table('documents')->where('status', 'sent')->update(['status' => 'acceptee']);
        DB::table('documents')->where('status', 'approved')->update(['status' => 'validee']);
        DB::table('documents')->where('status', 'partial')->update(['status' => 'partielle']);
        DB::table('documents')->where('status', 'delivered')->update(['status' => 'livree']);
        DB::table('documents')->where('status', 'paid')->update(['status' => 'facturee']);
        DB::table('documents')->where('status', 'cancelled')->update(['status' => 'annulee']);

        DB::statement("ALTER TABLE documents MODIFY status ENUM('brouillon','validee','acceptee','partielle','livree','expiree','facturee','annulee') NOT NULL DEFAULT 'brouillon'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE documents MODIFY status ENUM('draft','sent','approved','delivered','partial','paid','cancelled','brouillon','validee','acceptee','partielle','livree','expiree','facturee','annulee') NOT NULL DEFAULT 'draft'");

        DB::table('documents')->where('status', 'brouillon')->update(['status' => 'draft']);
        DB::table('documents')->where('status', 'acceptee')->update(['status' => 'sent']);
        DB::table('documents')->where('status', 'validee')->update(['status' => 'approved']);
        DB::table('documents')->where('status', 'partielle')->update(['status' => 'partial']);
        DB::table('documents')->where('status', 'livree')->update(['status' => 'delivered']);
        DB::table('documents')->where('status', 'facturee')->update(['status' => 'paid']);
        DB::table('documents')->where('status', 'annulee')->update(['status' => 'cancelled']);
        DB::table('documents')->where('status', 'expiree')->update(['status' => 'cancelled']);

        DB::statement("ALTER TABLE documents MODIFY status ENUM('draft','sent','approved','delivered','partial','paid','cancelled') NOT NULL DEFAULT 'draft'");

        Schema::table('document_items', function (Blueprint $table) {
            if (Schema::hasColumn('document_items', 'details')) {
                $table->dropColumn('details');
            }

            if (Schema::hasColumn('document_items', 'line_type')) {
                $table->dropColumn('line_type');
            }
        });
    }
};
