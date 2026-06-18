<?php

namespace App\Services;

use App\Models\Article;

class StockService
{
    public function adjustStock(Article $article, int $quantityAdjustment): Article
    {
        $article->stock = ($article->stock ?? 0) + $quantityAdjustment;
        $article->save();

        return $article;
    }

    public function reserve(Article $article, int $quantity): bool
    {
        if (($article->stock ?? 0) < $quantity) {
            return false;
        }

        $article->stock -= $quantity;
        $article->save();

        return true;
    }
}
