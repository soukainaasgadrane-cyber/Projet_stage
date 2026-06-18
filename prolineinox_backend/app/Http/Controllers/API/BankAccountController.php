<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\BankAccountRequest;
use App\Http\Resources\BankAccountResource;
use App\Models\BankAccount;

class BankAccountController extends Controller
{
    public function index()
    {
        $accounts = BankAccount::paginate(15);
        return BankAccountResource::collection($accounts);
    }

    public function store(BankAccountRequest $request)
    {
        $data = $request->validated();
        $data['name'] = $data['name'] ?? $data['bank_name'] ?? null;
        $data['balance'] = $data['balance'] ?? $data['current_balance'] ?? $data['initial_balance'] ?? 0;
        unset($data['bank_name'], $data['rib'], $data['initial_balance'], $data['current_balance']);

        $account = BankAccount::create($data);
        return new BankAccountResource($account);
    }

    public function show(BankAccount $bankAccount)
    {
        return new BankAccountResource($bankAccount);
    }

    public function update(BankAccountRequest $request, BankAccount $bankAccount)
    {
        $data = $request->validated();
        $data['name'] = $data['name'] ?? $data['bank_name'] ?? $bankAccount->name;
        $data['balance'] = $data['balance'] ?? $data['current_balance'] ?? $data['initial_balance'] ?? $bankAccount->balance;
        unset($data['bank_name'], $data['rib'], $data['initial_balance'], $data['current_balance']);

        $bankAccount->update($data);
        return new BankAccountResource($bankAccount);
    }

    public function destroy(BankAccount $bankAccount)
    {
        $bankAccount->delete();
        return response()->json(['message' => 'Bank account deleted']);
    }
}
