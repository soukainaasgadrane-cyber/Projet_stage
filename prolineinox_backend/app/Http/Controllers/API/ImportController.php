<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Company;
use App\Models\Contact;
use App\Models\Article;

use Illuminate\Support\Str;

class ImportController extends Controller
{
    public function importContacts(Request $request)
    {
        $file = $request->file('file');
        if (!$file || !$file->isValid()) {
            return response()->json(['message' => 'No valid file provided'], 422);
        }

        $count = 0;

        // If maatwebsite/excel is installed, use it for robust parsing
        if (class_exists('Maatwebsite\\Excel\\Facades\\Excel')) {
            try {
                $array = \Maatwebsite\Excel\Facades\Excel::toArray(null, $file);
                $rows = $array[0] ?? [];
                if (count($rows) == 0) return response()->json(['imported' => 0]);

                $header = array_map(function ($h) { return Str::snake(trim(strtolower($h))); }, $rows[0]);
                for ($i = 1; $i < count($rows); $i++) {
                    $row = $rows[$i];
                    $data = array_combine($header, $row);
                    if (!$data) continue;

                    $companyId = null;
                    if (!empty($data['company_id'])) {
                        $companyId = $data['company_id'];
                    } elseif (!empty($data['company'])) {
                        $company = Company::firstOrCreate(['name' => $data['company']], ['email' => $data['company_email'] ?? null]);
                        $companyId = $company->id;
                    }

                    Contact::updateOrCreate(
                        ['email' => $data['email'] ?? null, 'company_id' => $companyId],
                        [
                            'company_id' => $companyId,
                            'first_name' => $data['first_name'] ?? $data['prenom'] ?? null,
                            'last_name' => $data['last_name'] ?? $data['nom'] ?? null,
                            'phone' => $data['phone'] ?? $data['telephone'] ?? null,
                            'mobile' => $data['mobile'] ?? null,
                            'position' => $data['position'] ?? null,
                        ]
                    );
                    $count++;
                }
                return response()->json(['imported' => $count]);
            } catch (\Throwable $e) {
                return response()->json(['message' => 'Import failed: '.$e->getMessage()], 500);
            }
        }

        // Fallback to native CSV parsing
        $path = $file->getRealPath();
        $handle = fopen($path, 'r');
        if ($handle === false) {
            return response()->json(['message' => 'Unable to open file'], 500);
        }

        $header = null;
        while (($row = fgetcsv($handle, 0, ',')) !== false) {
            if (!$header) {
                $header = array_map(function ($h) { return Str::snake(trim(strtolower($h))); }, $row);
                continue;
            }

            $data = array_combine($header, $row);
            if (!$data) continue;

            $companyId = null;
            if (!empty($data['company_id'])) {
                $companyId = $data['company_id'];
            } elseif (!empty($data['company'])) {
                $company = Company::firstOrCreate(['name' => $data['company']], ['email' => $data['company_email'] ?? null]);
                $companyId = $company->id;
            }

            Contact::updateOrCreate(
                ['email' => $data['email'] ?? null, 'company_id' => $companyId],
                [
                    'company_id' => $companyId,
                    'first_name' => $data['first_name'] ?? $data['prenom'] ?? null,
                    'last_name' => $data['last_name'] ?? $data['nom'] ?? null,
                    'phone' => $data['phone'] ?? $data['telephone'] ?? null,
                    'mobile' => $data['mobile'] ?? null,
                    'position' => $data['position'] ?? null,
                ]
            );

            $count++;
        }
        fclose($handle);

        return response()->json(['imported' => $count]);
    }

    public function importArticles(Request $request)
    {
        $file = $request->file('file');
        if (!$file || !$file->isValid()) {
            return response()->json(['message' => 'No valid file provided'], 422);
        }

        $path = $file->getRealPath();
        $handle = fopen($path, 'r');
        if ($handle === false) {
            return response()->json(['message' => 'Unable to open file'], 500);
        }

        $header = null;
        $count = 0;
        while (($row = fgetcsv($handle, 0, ',')) !== false) {
            if (!$header) {
                $header = array_map(function ($h) { return Str::snake(trim(strtolower($h))); }, $row);
                continue;
            }

            $data = array_combine($header, $row);
            if (!$data) continue;

            $attributes = [
                'code' => $data['code'] ?? null,
                'name' => $data['name'] ?? null,
                'description' => $data['description'] ?? null,
                'category_id' => $data['category_id'] ?? null,
                'purchase_price' => isset($data['purchase_price']) ? floatval($data['purchase_price']) : 0,
                'selling_price' => isset($data['selling_price']) ? floatval($data['selling_price']) : 0,
                'stock_quantity' => isset($data['stock_quantity']) ? intval($data['stock_quantity']) : 0,
                'min_stock_alert' => isset($data['min_stock_alert']) ? intval($data['min_stock_alert']) : null,
                'unit' => $data['unit'] ?? null,
            ];

            if (!empty($attributes['code'])) {
                Article::updateOrCreate(['code' => $attributes['code']], $attributes);
            } else {
                Article::create($attributes);
            }

            $count++;
        }
        fclose($handle);

        return response()->json(['imported' => $count]);
    }

    public function importCompanies(Request $request)
    {
        $file = $request->file('file');
        if (!$file || !$file->isValid()) {
            return response()->json(['message' => 'No valid file provided'], 422);
        }

        $count = 0;

        // Excel via maatwebsite if available
        if (class_exists('Maatwebsite\\Excel\\Facades\\Excel')) {
            try {
                $array = \Maatwebsite\Excel\Facades\Excel::toArray(null, $file);
                $rows = $array[0] ?? [];
                if (count($rows) == 0) return response()->json(['imported' => 0]);

                $header = array_map(function ($h) { return Str::snake(trim(strtolower($h))); }, $rows[0]);
                for ($i = 1; $i < count($rows); $i++) {
                    $row = $rows[$i];
                    $data = array_combine($header, $row);
                    if (!$data) continue;

                    $attrs = [
                        'name' => $data['name'] ?? null,
                        'email' => $data['email'] ?? null,
                        'phone' => $data['phone'] ?? null,
                        'address' => $data['address'] ?? null,
                        'city' => $data['city'] ?? null,
                        'country' => $data['country'] ?? null,
                        'tax_number' => $data['tax_number'] ?? ($data['ice'] ?? null),
                    ];

                    Company::updateOrCreate(['email' => $attrs['email']], $attrs);
                    $count++;
                }
                return response()->json(['imported' => $count]);
            } catch (\Throwable $e) {
                return response()->json(['message' => 'Import failed: '.$e->getMessage()], 500);
            }
        }

        // CSV fallback
        $path = $file->getRealPath();
        $handle = fopen($path, 'r');
        if ($handle === false) {
            return response()->json(['message' => 'Unable to open file'], 500);
        }

        $header = null;
        while (($row = fgetcsv($handle, 0, ',')) !== false) {
            if (!$header) {
                $header = array_map(function ($h) { return Str::snake(trim(strtolower($h))); }, $row);
                continue;
            }

            $data = array_combine($header, $row);
            if (!$data) continue;

            $attrs = [
                'name' => $data['name'] ?? null,
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null,
                'city' => $data['city'] ?? null,
                'country' => $data['country'] ?? null,
                'tax_number' => $data['tax_number'] ?? ($data['ice'] ?? null),
            ];

            Company::updateOrCreate(['email' => $attrs['email']], $attrs);
            $count++;
        }
        fclose($handle);

        return response()->json(['imported' => $count]);
    }

    public function export($resource, Request $request)
    {
        $format = $request->query('format', 'csv');

        if ($resource === 'contacts') {
            $items = Contact::all();
            $filename = 'contacts_export_'.date('Ymd_His').'.csv';
            $headers = ['Content-Type' => 'text/csv', 'Content-Disposition' => "attachment; filename={$filename}"];

            $callback = function() use ($items) {
                $handle = fopen('php://output', 'w');
                fputcsv($handle, ['id','company_id','first_name','last_name','email','phone','mobile','position']);
                foreach ($items as $row) {
                    fputcsv($handle, [$row->id, $row->company_id, $row->first_name, $row->last_name, $row->email, $row->phone, $row->mobile, $row->position]);
                }
                fclose($handle);
            };

            return response()->stream($callback, 200, $headers);
        }

        if ($resource === 'articles') {
            $items = Article::all();
            $filename = 'articles_export_'.date('Ymd_His').'.csv';
            $headers = ['Content-Type' => 'text/csv', 'Content-Disposition' => "attachment; filename={$filename}"];

            $callback = function() use ($items) {
                $handle = fopen('php://output', 'w');
                fputcsv($handle, ['id','code','name','description','category_id','purchase_price','selling_price','stock_quantity','unit']);
                foreach ($items as $row) {
                    fputcsv($handle, [$row->id, $row->code, $row->name, $row->description, $row->category_id, $row->purchase_price, $row->selling_price, $row->stock_quantity, $row->unit]);
                }
                fclose($handle);
            };

            return response()->stream($callback, 200, $headers);
        }

        if ($resource === 'companies') {
            $items = Company::all();
            $filename = 'companies_export_'.date('Ymd_His').'.csv';
            $headers = ['Content-Type' => 'text/csv', 'Content-Disposition' => "attachment; filename={$filename}"];

            $callback = function() use ($items) {
                $handle = fopen('php://output', 'w');
                fputcsv($handle, ['id','name','email','phone','address','city','country','tax_number']);
                foreach ($items as $row) {
                    fputcsv($handle, [$row->id, $row->name, $row->email, $row->phone, $row->address, $row->city, $row->country, $row->tax_number]);
                }
                fclose($handle);
            };

            return response()->stream($callback, 200, $headers);
        }

        return response()->json(['message' => 'Resource not supported for export'], 400);
    }
}
