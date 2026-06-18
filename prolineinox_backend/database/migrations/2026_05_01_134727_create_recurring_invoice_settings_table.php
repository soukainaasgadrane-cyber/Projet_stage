<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('recurring_invoice_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained();
            $table->enum('frequency', ['monthly', 'quarterly', 'yearly']);
            $table->integer('interval_count')->default(1);
            $table->date('next_generation_date');
            $table->date('end_date')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('recurring_invoice_settings');
    }
};