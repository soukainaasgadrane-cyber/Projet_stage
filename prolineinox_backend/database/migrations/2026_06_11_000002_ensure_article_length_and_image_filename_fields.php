<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('articles', function (Blueprint $table) {
            if (!Schema::hasColumn('articles', 'image_filename')) {
                $table->string('image_filename')->nullable()->after('image_path');
            }

            if (!Schema::hasColumn('articles', 'length_cm')) {
                $table->decimal('length_cm', 8, 2)->nullable()->after('height_cm');
            }
        });
    }

    public function down()
    {
        // Compatibility migration only. Columns are owned by the main catalogue migration.
    }
};
