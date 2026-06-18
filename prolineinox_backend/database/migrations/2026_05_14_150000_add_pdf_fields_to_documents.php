<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->string('client_reference')->nullable()->after('reference');
            $table->string('responsible_name')->nullable()->after('contact_id');
            $table->date('validated_at')->nullable()->after('due_date');
        });

        Schema::table('document_items', function (Blueprint $table) {
            $table->string('reference')->nullable()->after('article_id');
            $table->string('unit')->nullable()->after('quantity');
        });
    }

    public function down()
    {
        Schema::table('document_items', function (Blueprint $table) {
            $table->dropColumn(['reference', 'unit']);
        });

        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn(['client_reference', 'responsible_name', 'validated_at']);
        });
    }
};
