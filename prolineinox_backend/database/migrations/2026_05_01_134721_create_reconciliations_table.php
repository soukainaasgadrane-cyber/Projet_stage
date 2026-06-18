<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('reconciliations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bank_account_id')->constrained();
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('statement_balance', 12, 2);
            $table->decimal('system_balance', 12, 2);
            $table->enum('status', ['pending', 'matched'])->default('pending');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('reconciliations');
    }
};