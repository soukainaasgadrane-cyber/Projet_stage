<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->enum('type', [
                'quote', 'proforma', 'order', 'delivery_note',
                'invoice', 'credit_note', 'recurring_invoice',
                'purchase_request', 'purchase_order', 'receipt_note',
                'supplier_invoice', 'supplier_credit_note'
            ]);
            $table->foreignId('company_id')->nullable()->constrained();
            $table->foreignId('contact_id')->nullable()->constrained();
            $table->foreignId('parent_document_id')->nullable()->constrained('documents');
            $table->date('document_date');
            $table->date('due_date')->nullable();
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('tax', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->enum('status', ['draft', 'sent', 'approved', 'delivered', 'partial', 'paid', 'cancelled'])->default('draft');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('documents');
    }
};