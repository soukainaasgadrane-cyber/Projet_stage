<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('cheques', function (Blueprint $table) {
            $table->id();
            $table->string('cheque_number');
            $table->foreignId('transaction_id')->nullable()->constrained();
            $table->foreignId('company_id')->constrained('companies');
            $table->decimal('amount', 12, 2);
            $table->date('issue_date');
            $table->date('due_date');
            $table->enum('status', ['pending', 'deposited', 'cleared', 'bounced'])->default('pending');
            $table->string('bank_name')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('cheques');
    }
};