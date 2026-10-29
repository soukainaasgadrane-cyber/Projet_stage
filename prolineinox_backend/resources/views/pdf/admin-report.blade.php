<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <style>
        @page { margin: 28px; }
        body { font-family: DejaVu Sans, sans-serif; color: #0f172a; font-size: 11px; }
        h1 { color: #082f49; margin-bottom: 4px; }
        .period { color: #475569; margin-bottom: 22px; }
        .metrics { width: 100%; margin-bottom: 20px; }
        .metrics td { width: 25%; background: #f1f5f9; padding: 12px; border: 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #cbd5e1; padding: 7px; text-align: left; }
        th { background: #082f49; color: white; }
    </style>
</head>
<body>
    <h1>INOXPROLINE — Rapport commercial</h1>
    <div class="period">Période : {{ $report['start'] }} au {{ $report['end'] }}</div>
    <table class="metrics"><tr>
        <td>Devis<br><strong>{{ $report['quotes'] }}</strong></td>
        <td>Commandes<br><strong>{{ $report['orders'] }}</strong></td>
        <td>CA facturé<br><strong>{{ number_format($report['revenue'], 2, ',', ' ') }} MAD</strong></td>
        <td>Encaissé<br><strong>{{ number_format($report['collected'], 2, ',', ' ') }} MAD</strong></td>
    </tr></table>
    <h2>Performance par commercial</h2>
    <table>
        <thead><tr><th>Commercial</th><th>Devis</th><th>Commandes</th><th>Conversion commandes/devis</th></tr></thead>
        <tbody>
            @foreach($report['performance'] as $commercial)
                <tr>
                    <td>{{ $commercial['name'] }}</td>
                    <td>{{ $commercial['quotes_count'] }}</td>
                    <td>{{ $commercial['orders_count'] }}</td>
                    <td>{{ $commercial['conversion_rate'] }}%</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
