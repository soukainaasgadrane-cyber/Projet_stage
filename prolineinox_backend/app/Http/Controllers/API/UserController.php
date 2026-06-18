<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function index()
    {
        return User::with('roles')->paginate(25);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['nullable', 'string', 'max:100'],
            'email' => ['required', 'email:rfc', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', Password::min(10)->mixedCase()->numbers()],
            'phone' => ['nullable', 'string', 'max:30'],
            'role' => ['nullable', Rule::in(['admin', 'employee'])],
            'is_active' => ['nullable', 'boolean'],
        ]);
        $data['password'] = Hash::make($data['password']);
        $data['name'] = trim(($data['first_name'] ?? '').' '.($data['last_name'] ?? ''));
        $user = User::create($data);
        if (!empty($request->role)) {
            $role = Role::firstOrCreate(['name' => $request->role]);
            $user->roles()->attach($role->id);
        }
        return response()->json($user->load('roles'));
    }

    public function show(User $user)
    {
        return response()->json($user->load('roles'));
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'first_name' => ['sometimes', 'string', 'max:100'],
            'last_name' => ['sometimes', 'nullable', 'string', 'max:100'],
            'email' => ['sometimes', 'email:rfc', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['sometimes', 'nullable', 'string', Password::min(10)->mixedCase()->numbers()],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'role' => ['sometimes', 'nullable', Rule::in(['admin', 'employee'])],
            'is_active' => ['sometimes', 'boolean'],
        ]);
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
            $user->tokens()->delete();
        } else {
            unset($data['password']);
        }
        if (isset($data['first_name']) || array_key_exists('last_name', $data)) {
            $data['name'] = trim(($data['first_name'] ?? $user->first_name).' '.($data['last_name'] ?? $user->last_name));
        }
        $user->update($data);
        return response()->json($user->load('roles'));
    }

    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function assignRole(Request $request, User $user)
    {
        $request->validate(['role' => 'required|string']);
        $role = Role::firstOrCreate(['name' => $request->role]);
        $user->roles()->syncWithoutDetaching([$role->id]);
        return response()->json($user->load('roles'));
    }
}
