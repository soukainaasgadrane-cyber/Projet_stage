<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\RecurringInvoiceSetting;
use App\Http\Requests\RecurringSettingRequest;
use App\Http\Resources\RecurringSettingResource;

class RecurringInvoiceSettingController extends Controller
{
    public function index()
    {
        $settings = RecurringInvoiceSetting::with('document')->paginate(20);
        return RecurringSettingResource::collection($settings);
    }

    public function store(RecurringSettingRequest $request)
    {
        $setting = RecurringInvoiceSetting::create($request->validated());
        return new RecurringSettingResource($setting);
    }

    public function update(RecurringSettingRequest $request, RecurringInvoiceSetting $recurringInvoiceSetting)
    {
        $recurringInvoiceSetting->update($request->validated());
        return new RecurringSettingResource($recurringInvoiceSetting);
    }

    public function destroy(RecurringInvoiceSetting $recurringInvoiceSetting)
    {
        $recurringInvoiceSetting->delete();
        return response()->json(['message' => 'Paramètre supprimé']);
    }
}