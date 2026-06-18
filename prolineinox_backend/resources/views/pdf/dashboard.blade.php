<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Dashboard {{ $year }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; }
        .header { text-align: center; margin-bottom: 20px; }
        .metrics { display: flex; gap: 10px; }
        .metric { padding: 10px; border: 1px solid #ddd; flex: 1; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 6px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Tableau de bord - {{ $year }}</h1>
    </div>

    <div class="metrics">
        <div class="metric"><strong>CA</strong><div>{{ $chiffre_affaires }}</div></div>
        <div class="metric"><strong>Recettes</strong><div>{{ $recettes }}</div></div>
        <div class="metric"><strong>Dépenses</strong><div>{{ $depenses }}</div></div>
        <div class="metric"><strong>Résultat</strong><div>{{ $resultat }}</div></div>
        <div class="metric"><strong>Marge %</strong><div>{{ $marge_percent }}</div></div>
    </div>

    <h3>Top Articles</h3>
    <table>
        <thead>
            <tr><th>Article</th><th>Quantité Vendue</th></tr>
        </thead>
        <tbody>
            @foreach($top_articles as $a)
                <tr><td>{{ $a->name }}</td><td>{{ $a->total_quantity }}</td></tr>
            @endforeach
        </tbody>
    </table>

    <div style="margin-top:20px; text-align:center; font-size:10px; color:#666">{{ config('app.url') ?? env('APP_URL') }}</div>
</body>
</html>
