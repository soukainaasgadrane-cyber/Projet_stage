<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Document {{ $document->reference ?? $document->id }}</title>
    <style>
        @page { margin: 28px 28px 78px 28px; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #333; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #999; padding: 6px; }
        th { background: #f2f2f2; font-weight: bold; text-align: center; }
        .top-table td { border: 0; padding: 0; vertical-align: top; }
        .brand { text-align: left; margin-bottom: 18px; width: 145px; color: #24456f; line-height: 1; }
        .logo-main { display: block; font-size: 18px; font-weight: bold; letter-spacing: 5px; }
        .logo-rule { display: block; width: 72px; height: 1px; margin: 7px 0 4px; background: #24456f; }
        .logo-sub { display: block; margin-left: 58px; margin-top: -14px; font-size: 12px; font-weight: bold; letter-spacing: 8px; color: #3f4f63; }
        .logo-tagline { display: block; margin-top: 10px; font-size: 5px; font-weight: bold; letter-spacing: 1px; color: #4d5968; }
        .document-title { margin: 0 0 18px 0; font-size: 15px; font-weight: normal; letter-spacing: 0; text-transform: uppercase; }
        .meta-table { width: 270px; margin-bottom: 28px; font-size: 11px; }
        .meta-table th, .meta-table td { border: 0; padding: 4px 0; text-align: left; background: transparent; }
        .meta-table th { width: 92px; color: #666; font-weight: normal; }
        .client-box { border: 1px solid #ddd; padding: 10px 12px; min-height: 82px; margin-top: 74px; font-size: 11px; }
        .muted { color: #666; font-size: 11px; line-height: 1.45; }
        .items-table { table-layout: fixed; font-size: 11px; margin-top: 2px; }
        .items-table th { border-color: #444; background: #2c2c2c; color: #fff; padding: 7px 8px; font-size: 10px; text-align: left; text-transform: uppercase; }
        .items-table th.num, .items-table td.num { text-align: right; }
        .items-table td { border-left: 0; border-right: 0; border-top: 0; border-bottom: 1px solid #ccc; height: 48px; padding: 7px 8px; vertical-align: top; }
        .items-table .empty-line td { height: 48px; color: transparent; }
        .amount-words { width: 48%; float: left; margin-top: 30px; line-height: 1.45; font-size: 10px; }
        .amount-words .title { font-weight: bold; text-transform: uppercase; margin-bottom: 4px; }
        .amount-table { width: 300px; float: right; margin-top: 12px; }
        .amount-table td { border: 0; background: transparent; padding: 7px 4px; font-weight: normal; }
        .amount-table .net td { border-top: 1px solid #aaa; border-bottom: 1px solid #aaa; font-weight: bold; }
        .conditions { clear: both; padding-top: 34px; width: 58%; font-size: 10px; line-height: 1.45; }
        .conditions .title, .notes-box .title { font-weight: bold; text-transform: uppercase; margin-bottom: 14px; }
        .notes-box { width: 58%; margin-top: 28px; font-size: 10px; line-height: 1.45; }
        .footer { position: fixed; bottom: 22px; left: 0; right: 0; text-align: center; font-size: 10px; color: #555; line-height: 1.55; }
        .page-number { position: fixed; bottom: 6px; left: 0; right: 0; text-align: center; font-size: 10px; color: #555; }
    </style>
</head>
<body>
    @php
        $documentLabels = [
            'quote' => 'Devis',
            'devis' => 'Devis',
            'proforma' => 'Facture proforma',
            'order' => 'Bon commande',
            'delivery_note' => 'Bon livraison',
            'invoice' => 'Facture',
            'credit_note' => 'Avoir',
            'purchase_request' => 'Demande achat',
            'purchase_order' => 'Bon commande',
            'receipt_note' => 'Bon reception',
            'supplier_invoice' => 'Facture fournisseur',
            'supplier_credit_note' => 'Avoir fournisseur',
        ];
        $documentTitle = $documentLabels[$document->type ?? ''] ?? ucfirst($document->type ?? 'Document');
        $documentDate = $document->document_date ?? $document->created_at ?? now();
        $validUntil = $document->due_date ?? \Carbon\Carbon::parse($documentDate)->copy()->addDays(30);
        $defaultConditions = "Conditions de paiement : 50% d'avance et 50% a la livraison.";
        $conditions = $defaultConditions;
        $note = trim($document->notes ?? '');
        if ($note === '' || str_contains($note, '50%')) {
            $note = 'Nous vous remercions de votre confiance';
        }
        $isQuote = ($document->type ?? '') === 'quote';
        $totalTtc = (float) ($document->total ?? 0);
        $amountWords = null;
        if (class_exists('\NumberFormatter')) {
            try {
                $formatter = new \NumberFormatter('fr_FR', \NumberFormatter::SPELLOUT);
                $dirhams = (int) floor($totalTtc);
                $centimes = (int) round(($totalTtc - $dirhams) * 100);
                $amountWords = ucfirst($formatter->format($dirhams)) . ' dirhams';
                if ($centimes > 0) {
                    $amountWords .= ' et ' . $formatter->format($centimes) . ' centimes';
                }
                $amountWords .= ' toutes taxes comprises';
            } catch (\Throwable $e) {
                $amountWords = null;
            }
        }
    @endphp

    <table class="top-table">
        <tr>
            <td style="width:50%;">
                <div class="brand">
                    <span class="logo-main">INOX</span>
                    <span class="logo-rule"></span>
                    <span class="logo-sub">PRO LINE</span>
                    <span class="logo-tagline">CONCEPTION • FABRICATION • INSTALLATION</span>
                </div>

                <div class="document-title">{{ $documentTitle }}</div>
                <table class="meta-table">
                    <tr>
                        <th>Reference</th>
                        <td>{{ $document->reference ?? $document->id }}</td>
                    </tr>
                    @if($document->client_reference)
                        <tr>
                            <th>Ref. client</th>
                            <td>{{ $document->client_reference }}</td>
                        </tr>
                    @endif
                    <tr>
                        <th>Date</th>
                        <td>{{ \Carbon\Carbon::parse($documentDate)->format('d/m/Y') }}</td>
                    </tr>
                    <tr>
                        <th>{{ $isQuote ? 'Validite' : 'Echeance' }}</th>
                        <td>{{ \Carbon\Carbon::parse($validUntil)->format('d/m/Y') }}</td>
                    </tr>
                </table>
            </td>
            <td style="width:50%;">
                <div class="client-box">
                    <strong>{{ $company->name ?? 'Client' }}</strong><br>
                    @if($document->responsible_name)
                        Responsable: {{ $document->responsible_name }}<br>
                    @endif
                    <span class="muted">
                        ICE: {{ $company->tax_number ?? '' }}<br>
                        {{ $company->address ?? '' }}<br>
                        {{ $company->city ?? '' }} {{ $company->country ?? '' }}
                    </span>
                </div>
            </td>
        </tr>
    </table>

    <table class="items-table">
        <thead>
            <tr>
                <th style="width:70%;">Designation</th>
                <th class="num" style="width:8%;">Qte</th>
                <th class="num" style="width:11%;">PU HT</th>
                <th class="num" style="width:11%;">PT HT</th>
            </tr>
        </thead>
        <tbody>
            @php
                $itemsCount = count($items);
                $minimumRows = 12;
                $emptyRows = max(0, $minimumRows - $itemsCount);
            @endphp
            @forelse($items as $item)
                @php
                    $quantity = (float) ($item->quantity ?? 0);
                    $unitPrice = (float) ($item->unit_price ?? 0);
                    $lineHt = $quantity * $unitPrice;
                @endphp
                <tr>
                    <td>{{ $item->description ?? $item->name ?? '' }}</td>
                    <td class="num">{{ $item->quantity ?? $item->qty ?? '' }}</td>
                    <td class="num">{{ number_format((float) ($item->unit_price ?? $item->price ?? 0), 2) }}</td>
                    <td class="num">{{ number_format($lineHt, 2) }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" style="height:34px; text-align:center; color:#777;">Aucun article</td>
                </tr>
            @endforelse
            @for($i = 0; $i < $emptyRows; $i++)
                <tr class="empty-line">
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                </tr>
            @endfor
        </tbody>
    </table>

    <div class="amount-words">
        <div class="title">Arrete le present {{ strtolower($documentTitle) }} a la somme de :</div>
        <div>{{ $amountWords ?? number_format($document->total ?? 0, 2) . ' dirhams toutes taxes comprises' }}</div>
    </div>

    <table class="amount-table">
        <tr>
            <td>Total HT</td>
            <td style="text-align:right">{{ number_format($document->subtotal ?? 0, 2) }}</td>
        </tr>
        <tr>
            <td>TVA (20%)</td>
            <td style="text-align:right">{{ number_format($document->tax ?? 0, 2) }}</td>
        </tr>
        <tr class="net">
            <td>Montant NET TTC (MAD)</td>
            <td style="text-align:right">{{ number_format($document->total ?? 0, 2) }}</td>
        </tr>
    </table>

    <div class="conditions">
        <div class="title">Conditions:</div>
        <div>{!! nl2br(e($conditions)) !!}</div>
    </div>

    <div class="notes-box">
        <div class="title">Notes:</div>
        <div>{!! nl2br(e($note)) !!}</div>
    </div>

    <div class="footer">
        Adresse: {{ config('app.name', 'InoxProline') }} ; 
          S.A.R.L A.U au capital de 100 000,00 Dhs 26 AVENUE MERS SULTANE TG1 APPT N°3

          Addresse: Rue 7 N 5 ETG 2 Appt N 4 SAADA SIDI BERNOUSSI CASABLANCA;
          Email: contact@inoxproline.ma<br />
          RC 370277 ***** TP : 31621181 ***** LF: 20745460 ***** ICE 001877012000072
Casa Maroc

R.C.: 724691*****T.P: 34109698*****I.F.: 72053253*****

ICE: 003890444000088
    </div>
    <div class="page-number">1 / 1</div>
</body>
</html>
