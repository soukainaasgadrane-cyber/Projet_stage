<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('cheque_deposit_cheque', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cheque_deposit_id')->constrained()->onDelete('cascade');
            $table->foreignId('cheque_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('cheque_deposit_cheque');
    }
};