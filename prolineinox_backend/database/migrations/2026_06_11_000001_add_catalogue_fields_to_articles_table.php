<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->string('image_path')->nullable()->after('description');
            $table->string('image_filename')->nullable()->after('image_path');
            $table->decimal('height_cm', 8, 2)->nullable()->after('image_filename');
            $table->decimal('length_cm', 8, 2)->nullable()->after('height_cm');
            $table->decimal('width_cm', 8, 2)->nullable()->after('length_cm');
            $table->decimal('depth_cm', 8, 2)->nullable()->after('width_cm');
            $table->unsignedSmallInteger('price_start_cm')->default(60)->after('selling_price');
            $table->unsignedSmallInteger('price_step_cm')->default(10)->after('price_start_cm');
            $table->decimal('price_step_amount', 12, 2)->default(0)->after('price_step_cm');
            $table->json('price_variants')->nullable()->after('price_step_amount');
        });
    }

    public function down()
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->dropColumn([
                'image_path',
                'image_filename',
                'height_cm',
                'length_cm',
                'width_cm',
                'depth_cm',
                'price_start_cm',
                'price_step_cm',
                'price_step_amount',
                'price_variants',
            ]);
        });
    }
};
