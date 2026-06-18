<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Article;
use App\Models\Category;

class ArticleSeeder extends Seeder
{
    public function run()
    {
        $category = Category::first();

        Article::updateOrCreate(['code' => 'PC001'], [
            'code' => 'PC001',
            'name' => 'Ordinateur portable',
            'category_id' => $category->id ?? null,
            'purchase_price' => 5000,
            'selling_price' => 7500,
            'stock_quantity' => 10,
            'min_stock_alert' => 2,
            'unit' => 'pièce',
        ]);

        Article::updateOrCreate(['code' => 'MON002'], [
            'code' => 'MON002',
            'name' => 'Moniteur 24 pouces',
            'category_id' => $category->id ?? null,
            'purchase_price' => 1200,
            'selling_price' => 1800,
            'stock_quantity' => 15,
            'unit' => 'pièce',
        ]);
    }
}
