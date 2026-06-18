<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\CompanyRequest;
use App\Http\Resources\CompanyResource;
use App\Models\Company;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    public function index()
    {
        $companies = Company::with('contacts')->paginate(15);
        return CompanyResource::collection($companies);
    }

    public function store(CompanyRequest $request)
    {
        $data = $request->validated();
        // accept 'ice' as alias for tax_number
        if (!empty($data['ice'])) {
            $data['tax_number'] = $data['ice'];
            unset($data['ice']);
        }
        $company = Company::create($data);
        return new CompanyResource($company);
    }

    public function show(Company $company)
    {
        $company->load('contacts');
        return new CompanyResource($company);
    }

    public function update(CompanyRequest $request, Company $company)
    {
        $data = $request->validated();
        if (!empty($data['ice'])) {
            $data['tax_number'] = $data['ice'];
            unset($data['ice']);
        }
        $company->update($data);
        return new CompanyResource($company);
    }

    public function destroy(Company $company)
    {
        $documentsCount = $company->documents()->count();
        $chequesCount = $company->cheques()->count();

        if ($documentsCount > 0 || $chequesCount > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer cette societe car elle est liee a des documents ou des cheques.',
                'details' => [
                    'documents_count' => $documentsCount,
                    'cheques_count' => $chequesCount,
                ],
            ], 409);
        }

        $company->delete();
        return response()->json(['message' => 'Company deleted successfully']);
    }
}
