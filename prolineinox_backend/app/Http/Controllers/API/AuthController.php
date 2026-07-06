<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\ActivityLog;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email:rfc', 'max:255'],
            'password' => ['required', 'string', 'max:255'],
        ]);

        $email = strtolower(trim($credentials['email']));
        $user = User::whereRaw('LOWER(email) = ?', [$email])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email ou mot de passe incorrect'],
            ]);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => "Votre compte a ete bloque par l'administrateur.",
            ], 403);
        }

        $expiresAt = now()->addMinutes((int) config('sanctum.expiration', 480));
        $user->last_login_at = now();
        $user->saveQuietly();

        // Keep one active API token per user to reduce forgotten sessions.
        $user->tokens()->where('name', 'erp-api')->delete();
        $token = $user->createToken('erp-api', ['*'], $expiresAt)->plainTextToken;
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'login',
            'model_type' => User::class,
            'model_id' => $user->id,
            'old_values' => null,
            'new_values' => null,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Connexion reussie',
            'user' => $this->safeUser($user),
            'token' => $token,
            'expires_at' => $expiresAt->toISOString(),
        ]);
    }

    public function user(Request $request)
    {
        return response()->json($this->safeUser($request->user()));
    }

    public function logout(Request $request)
    {
        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'logout',
            'model_type' => User::class,
            'model_id' => $request->user()->id,
            'old_values' => null,
            'new_values' => null,
            'ip_address' => $request->ip(),
        ]);

        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Deconnecte',
        ]);
    }

    private function safeUser(User $user): User
    {
        if (Schema::hasTable('roles') && Schema::hasTable('role_user')) {
            return $user->load('roles');
        }

        return $user;
    }
}
