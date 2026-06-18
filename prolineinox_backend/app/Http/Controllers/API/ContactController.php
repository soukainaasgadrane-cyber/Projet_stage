<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContactRequest;
use App\Http\Resources\ContactResource;
use App\Models\Contact;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function index(Request $request)
    {
        $query = Contact::with('company');
        if ($request->has('company_id')) {
            $query->where('company_id', $request->company_id);
        }
        $contacts = $query->paginate(15);
        return ContactResource::collection($contacts);
    }

    public function store(ContactRequest $request)
    {
        $contact = Contact::create($request->validated());
        return new ContactResource($contact);
    }

    public function show(Contact $contact)
    {
        $contact->load('company');
        return new ContactResource($contact);
    }

    public function update(ContactRequest $request, Contact $contact)
    {
        $contact->update($request->validated());
        return new ContactResource($contact);
    }

    public function destroy(Contact $contact)
    {
        $contact->delete();
        return response()->json(['message' => 'Contact deleted successfully']);
    }
}