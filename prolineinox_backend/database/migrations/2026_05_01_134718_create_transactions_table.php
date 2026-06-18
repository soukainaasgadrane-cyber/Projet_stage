<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
       Schema::create('transactions', function (Blueprint $table) {
    $table->id();

    $table->foreignId('bank_account_id')
        ->constrained('bank_accounts')
        ->onDelete('cascade');

    $table->decimal('amount', 12, 2);
    $table->enum('type', ['in', 'out']);
    $table->text('description')->nullable();

    $table->timestamps();
});
    }

    public function down()
    {
        Schema::dropIfExists('transactions');
    }
};