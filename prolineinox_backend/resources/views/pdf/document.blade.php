<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Document {{ $document->reference ?? $document->id }}</title>
    <style>
        @page { margin: 28px 28px 92px 28px; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 13px; color: #111; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #999; padding: 6px; }
        th { background: #f2f2f2; font-weight: bold; text-align: center; }
        .top-table td { border: 0; padding: 0; vertical-align: top; }
        .brand { text-align: left; margin-bottom: 18px; width: 185px; color: #24456f; line-height: 1; }
        .brand-logo { display: block; width: 185px; height: auto; margin-bottom: 8px; }
        .logo-main { display: block; font-size: 18px; font-weight: bold; letter-spacing: 5px; }
        .logo-rule { display: block; width: 72px; height: 1px; margin: 7px 0 4px; background: #24456f; }
        .logo-sub { display: block; margin-left: 58px; margin-top: -14px; font-size: 12px; font-weight: bold; letter-spacing: 8px; color: #3f4f63; }
        .logo-tagline { display: block; margin-top: 10px; font-size: 5px; font-weight: bold; letter-spacing: 1px; color: #4d5968; }
        .document-title { margin: 0 0 18px 0; font-size: 15px; font-weight: normal; letter-spacing: 0; text-transform: uppercase; }
        .meta-table { width: 270px; margin-bottom: 28px; font-size: 11.5px; }
        .meta-table th, .meta-table td { border: 0; padding: 4px 0; text-align: left; background: transparent; }
        .meta-table th { width: 92px; color: #666; font-weight: normal; }
        .meta-table .linked-row th, .meta-table .linked-row td { padding-top: 8px; }
        .client-box { border: 1px solid #ddd; padding: 10px 12px; min-height: 82px; margin-top: 74px; font-size: 11.5px; }
        .muted { color: #444; font-size: 11px; line-height: 1.45; }
        .items-table { table-layout: fixed; font-size: 12.5px; margin-top: 2px; }
        .items-table th { border-color: #444; background: #2c2c2c; color: #fff; padding: 7px 8px; font-size: 11px; text-align: left; text-transform: uppercase; }
        .items-table th.num, .items-table td.num { text-align: right; }
        .items-table td { border-left: 0; border-right: 0; border-top: 0; border-bottom: 1px solid #ccc; height: 28px; padding: 5px 8px; vertical-align: top; line-height: 1.45; }
        .item-details { font-size: 11.5px; line-height: 1.4; }
        .amount-words { width: 48%; float: left; margin-top: 30px; line-height: 1.45; font-size: 11.5px; }
        .amount-words .title { font-weight: bold; text-transform: uppercase; margin-bottom: 4px; }
        .amount-table { width: 300px; float: right; margin-top: 12px; font-size: 11.5px; }
        .amount-table td { border: 0; background: transparent; padding: 6px 4px; font-weight: 600; }
        .amount-table .net td { border-top: 1px solid #aaa; border-bottom: 1px solid #aaa; font-weight: 600; }
        .conditions { clear: both; padding-top: 20px; width: 58%; font-size: 11.5px; line-height: 1.45; }
        .conditions .title, .notes-box .title, .payments-box .title { font-weight: bold; text-transform: uppercase; margin-bottom: 8px; }
        .payments-box { clear: both; padding-top: 22px; width: 70%; font-size: 10px; line-height: 1.45; }
        .payments-box ul { margin: 0 0 0 18px; padding: 0; }
        .payments-box li { margin-bottom: 6px; }
        .notes-box { width: 58%; margin-top: 18px; margin-bottom: 18px; font-size: 12px; line-height: 1.45; }
        .notes-box .title { font-size: 11.5px; }
        .footer-spacer { clear: both; height: 58px; }
        .footer { position: fixed; bottom: 4px; left: 0; right: 0; text-align: center; font-size: 9px; font-weight: bold; color: #000; line-height: 1.4; }
        .page-number { position: fixed; bottom: 4px; left: 0; right: 0; text-align: center; font-size: 10px; color: #222; }
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
        $isInvoice = ($document->type ?? '') === 'invoice';
        $sourceQuote = null;
        $sourceOrder = null;
        $sourcePurchaseOrder = null;
        $ancestor = $document->parentDocument;
        while ($ancestor) {
            if ($ancestor->type === 'quote' && ! $sourceQuote) {
                $sourceQuote = $ancestor;
            }
            if ($ancestor->type === 'order' && ! $sourceOrder) {
                $sourceOrder = $ancestor;
            }
            if ($ancestor->type === 'purchase_order' && ! $sourcePurchaseOrder) {
                $sourcePurchaseOrder = $ancestor;
            }
            $ancestor = $ancestor->parentDocument;
        }
        $payments = $isInvoice
            ? $document->transactions->where('type', 'income')->sortBy('transaction_date')
            : collect();
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
        if (! $amountWords) {
            $units = [
                0 => 'zero', 1 => 'un', 2 => 'deux', 3 => 'trois', 4 => 'quatre',
                5 => 'cinq', 6 => 'six', 7 => 'sept', 8 => 'huit', 9 => 'neuf',
                10 => 'dix', 11 => 'onze', 12 => 'douze', 13 => 'treize', 14 => 'quatorze',
                15 => 'quinze', 16 => 'seize',
            ];
            $tens = [
                20 => 'vingt', 30 => 'trente', 40 => 'quarante', 50 => 'cinquante',
                60 => 'soixante', 80 => 'quatre-vingt',
            ];
            $numberToFrench = function (int $number) use (&$numberToFrench, $units, $tens): string {
                if ($number < 17) {
                    return $units[$number];
                }
                if ($number < 20) {
                    return 'dix-' . $units[$number - 10];
                }
                if ($number < 70) {
                    $ten = intdiv($number, 10) * 10;
                    $rest = $number % 10;
                    return $tens[$ten] . ($rest ? ($rest === 1 ? ' et un' : '-' . $units[$rest]) : '');
                }
                if ($number < 80) {
                    return 'soixante-' . $numberToFrench($number - 60);
                }
                if ($number < 100) {
                    $rest = $number - 80;
                    return 'quatre-vingt' . ($rest ? '-' . $numberToFrench($rest) : 's');
                }
                if ($number < 1000) {
                    $hundred = intdiv($number, 100);
                    $rest = $number % 100;
                    $prefix = $hundred === 1 ? 'cent' : $units[$hundred] . ' cent';
                    return $prefix . ($rest ? ' ' . $numberToFrench($rest) : ($hundred > 1 ? 's' : ''));
                }
                if ($number < 1000000) {
                    $thousand = intdiv($number, 1000);
                    $rest = $number % 1000;
                    $prefix = $thousand === 1 ? 'mille' : $numberToFrench($thousand) . ' mille';
                    return $prefix . ($rest ? ' ' . $numberToFrench($rest) : '');
                }
                $million = intdiv($number, 1000000);
                $rest = $number % 1000000;
                $prefix = $numberToFrench($million) . ' million' . ($million > 1 ? 's' : '');
                return $prefix . ($rest ? ' ' . $numberToFrench($rest) : '');
            };
            $dirhams = (int) floor($totalTtc);
            $centimes = (int) round(($totalTtc - $dirhams) * 100);
            $amountWords = ucfirst($numberToFrench($dirhams)) . ' dirham' . ($dirhams > 1 ? 's' : '');
            if ($centimes > 0) {
                $amountWords .= ' et ' . $numberToFrench($centimes) . ' centime' . ($centimes > 1 ? 's' : '');
            }
            $amountWords .= ' toutes taxes comprises';
        }
    @endphp

    <table class="top-table">
        <tr>
            <td style="width:50%;">
                <div class="brand">
                    @if(!empty($logo_path))
                        <img class="brand-logo" src="{{ $logo_path }}" alt="PRO LINE INOX">
                    @else
                        <span class="logo-main">INOX</span>
                        <span class="logo-rule"></span>
                        <span class="logo-sub">PRO LINE</span>
                        <span class="logo-tagline">CONCEPTION • FABRICATION • INSTALLATION</span>
                    @endif
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
                    @if($sourceQuote)
                        <tr class="linked-row">
                            <th>Devis</th>
                            <td>{{ $sourceQuote->reference }}</td>
                        </tr>
                    @endif
                    @if($sourceOrder)
                        <tr>
                            <th>Commande</th>
                            <td>{{ $sourceOrder->reference }}</td>
                        </tr>
                    @endif
                    @if($sourcePurchaseOrder)
                        <tr>
                            <th>Bon commande</th>
                            <td>{{ $sourcePurchaseOrder->reference }}</td>
                        </tr>
                    @endif
                </table>
            </td>
            <td style="width:50%;">
                <div class="client-box">
                    <strong>{{ $company->name ?? 'Client' }}</strong><br>
                    @if($document->responsible_name)
                        Responsable: {{ $document->responsible_name }}<br>
                    @endif
                    @if($document->subject)
                        Projet: {{ $document->subject }}<br>
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
                @if(! $isInvoice)
                    <th style="width:14%;">Reference</th>
                @endif
                <th style="width:{{ $isInvoice ? '70%' : '56%' }};">Designation</th>
                <th class="num" style="width:8%;">Qte</th>
                <th class="num" style="width:11%;">PU HT</th>
                <th class="num" style="width:11%;">PT HT</th>
            </tr>
        </thead>
        <tbody>
            @forelse($items as $item)
                @php
                    $quantity = (float) ($item->quantity ?? 0);
                    $unitPrice = (float) ($item->unit_price ?? 0);
                    $lineHt = $quantity * $unitPrice;
                @endphp
                <tr>
                    @if(! $isInvoice)
                        <td>{{ $item->reference ?? $item->article->code ?? '' }}</td>
                    @endif
                    <td>
                        <strong>{{ $item->description ?? $item->name ?? '' }}</strong>
                        @if(!empty($item->details))
                            <br><span class="muted item-details">{!! nl2br(e($item->details)) !!}</span>
                        @endif
                    </td>
                    <td class="num">{{ $item->quantity ?? $item->qty ?? '' }}</td>
                    <td class="num">{{ number_format((float) ($item->unit_price ?? $item->price ?? 0), 2) }}</td>
                    <td class="num">{{ number_format($lineHt, 2) }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="{{ $isInvoice ? 4 : 5 }}" style="height:34px; text-align:center; color:#777;">Aucun article</td>
                </tr>
            @endforelse
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

    @if($isInvoice && $payments->count())
        <div class="payments-box">
            <div class="title">Paiements recus:</div>
            <ul>
                @foreach($payments as $payment)
                    <li>
                        {{ number_format((float) $payment->amount, 2, ',', ' ') }} MAD
                        regle le {{ $payment->transaction_date ? \Carbon\Carbon::parse($payment->transaction_date)->format('d/m/Y') : '' }}
                        @if($payment->payment_method)
                            par {{ $payment->payment_method }}
                        @endif
                    </li>
                @endforeach
            </ul>
        </div>
    @endif

    <div class="conditions">
        <div class="title">Conditions:</div>
        <div>{!! nl2br(e($conditions)) !!}</div>
    </div>

    <div class="notes-box">
        <div class="title">Notes:</div>
        <div>{!! nl2br(e($note)) !!}</div>
    </div>

    <div class="footer-spacer"></div>

    <div class="footer">
        S.A.R.L A.U au capital de 100 000,00 Dhs 26 AVENUE MERS SULTANE TG1 APPT N&deg;3<br>
        Addresse: Rue 7 N 5 ETG 2 Appt N 4 SAADA SIDI BERNOUSSI CASABLANCA; Email: contact@inoxproline.ma<br>
        R.C.: 724691 ***** T.P: 34109698 ***** I.F.: 72053253 ***** ICE: 003890444000088
    </div>
    <div class="page-number">1 / 1</div>
</body>
</html>
