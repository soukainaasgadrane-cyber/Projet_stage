<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\ArticleRequest;
use App\Http\Resources\ArticleResource;
use App\Models\Article;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    public function index(Request $request)
    {
        $articles = Article::with('category')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->get('search');
                $query->where(function ($subQuery) use ($search) {
                    $subQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(15);

        return ArticleResource::collection($articles);
    }

    public function store(ArticleRequest $request)
    {
        $data = $request->safe()->except('image');

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('articles', 'public');
            $data['image_filename'] = basename($data['image_path']);
        }

        $article = Article::create($data);
        return new ArticleResource($article);
    }

    public function show(Article $article)
    {
        $article->load('category');
        return new ArticleResource($article);
    }

    public function update(ArticleRequest $request, Article $article)
    {
        $data = $request->safe()->except('image');

        if ($request->hasFile('image')) {
            if ($article->image_path) {
                Storage::disk('public')->delete($article->image_path);
            }

            $data['image_path'] = $request->file('image')->store('articles', 'public');
            $data['image_filename'] = basename($data['image_path']);
        }

        $article->update($data);
        return new ArticleResource($article);
    }

    public function uploadImage(Request $request, Article $article)
    {
        $data = $request->validate([
            'image' => 'required|image|max:4096',
        ]);

        if ($article->image_path) {
            Storage::disk('public')->delete($article->image_path);
        }

        $path = $data['image']->store('articles', 'public');
        $article->update([
            'image_path' => $path,
            'image_filename' => basename($path),
        ]);

        return new ArticleResource($article);
    }

    public function destroy(Article $article)
    {
        DB::transaction(function () use ($article) {
            $article->documentItems()->update(['article_id' => null]);
            if ($article->image_path) {
                Storage::disk('public')->delete($article->image_path);
            }
            $article->delete();
        });

        return response()->json(['message' => 'Article deleted']);
    }
}
