<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Document;
use App\Models\DocumentItem;
use App\Models\Article;
use App\Models\Company;
use App\Models\User;

class DocumentSeeder extends Seeder
{
    public function run()
    {
        $user = User::first();
        $company = Company::first();
        $article1 = Article::where('code', 'PC001')->first();
        $article2 = Article::where('code', 'MON002')->first();

        if (! $user || ! $company) {
            return;
        }

        $invoice = Document::updateOrCreate(
            ['reference' => 'FAC000001'],
            [
                'reference' => 'FAC000001',
                'type' => 'invoice',
                'company_id' => $company->id,
                'document_date' => '2026-02-15',
                'due_date' => '2026-03-15',
                'subtotal' => 9300,
                'tax' => 1750,
                'discount' => 0,
                'total' => 11050,
                'status' => 'paid',
                'created_by' => $user->id,
            ]
        );

        if ($article1) {
            DocumentItem::updateOrCreate([
                'document_id' => $invoice->id,
                'article_id' => $article1->id,
            ], [
                'description' => 'Ordinateur portable',
                'quantity' => 1,
                'unit_price' => 7500,
                'discount_percent' => 0,
                'tax_rate' => 20,
                'total' => 9000,
            ]);
        }

        if ($article2) {
            DocumentItem::updateOrCreate([
                'document_id' => $invoice->id,
                'article_id' => $article2->id,
            ], [
                'description' => 'Moniteur',
                'quantity' => 1,
                'unit_price' => 1800,
                'discount_percent' => 0,
                'tax_rate' => 20,
                'total' => 2160,
            ]);
        }
    }
}
