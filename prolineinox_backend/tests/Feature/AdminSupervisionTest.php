<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class AdminSupervisionTest extends TestCase
{
    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createAdminSchema();
        $this->admin = User::create([
            'name' => 'Admin Test', 'email' => 'admin@test.local', 'password' => bcrypt('password'),
            'role' => 'admin', 'is_active' => true, 'account_status' => 'active',
        ]);
    }

    public function test_admin_dashboard_uses_real_document_and_payment_totals(): void
    {
        DB::table('companies')->insert(['id' => 1, 'name' => 'Client Test', 'created_at' => now(), 'updated_at' => now()]);
        $date = today()->toDateString();
        DB::table('documents')->insert([
            ['reference' => 'DEV-TEST', 'type' => 'quote', 'company_id' => 1, 'created_by' => $this->admin->id, 'document_date' => $date, 'due_date' => today()->addDays(4)->toDateString(), 'status' => 'sent', 'payment_status' => null, 'total' => 1200, 'created_at' => now(), 'updated_at' => now()],
            ['reference' => 'CMD-TEST', 'type' => 'order', 'company_id' => 1, 'created_by' => $this->admin->id, 'document_date' => $date, 'due_date' => today()->addDay()->toDateString(), 'status' => 'approved', 'payment_status' => null, 'total' => 1200, 'created_at' => now(), 'updated_at' => now()],
            ['reference' => 'FAC-TEST', 'type' => 'invoice', 'company_id' => 1, 'created_by' => $this->admin->id, 'document_date' => $date, 'due_date' => today()->addDay()->toDateString(), 'status' => 'sent', 'payment_status' => 'unpaid', 'total' => 1200, 'created_at' => now(), 'updated_at' => now()],
        ]);
        DB::table('transactions')->insert(['type' => 'income', 'amount' => 450, 'transaction_date' => $date, 'created_at' => now(), 'updated_at' => now()]);
        $commercial = User::create([
            'name' => 'Sales Test', 'email' => 'sales@test.local', 'password' => bcrypt('password'),
            'role' => 'employee', 'is_active' => true, 'account_status' => 'active',
        ]);
        $quoteId = DB::table('documents')->insertGetId([
            'reference' => 'DEV-SALES', 'type' => 'quote', 'company_id' => 1, 'created_by' => $commercial->id,
            'document_date' => $date, 'due_date' => today()->addDays(4)->toDateString(), 'status' => 'sent', 'total' => 300,
            'created_at' => now(), 'updated_at' => now(),
        ]);
        DB::table('documents')->insert([
            'reference' => 'CMD-SALES', 'type' => 'order', 'company_id' => 1, 'created_by' => $commercial->id, 'parent_document_id' => $quoteId,
            'document_date' => $date, 'due_date' => today()->addDay()->toDateString(), 'status' => 'approved', 'total' => 300,
            'created_at' => now(), 'updated_at' => now(),
        ]);

        $this->actingAs($this->admin, 'sanctum')->getJson('/api/admin/dashboard')
            ->assertOk()
            ->assertJsonPath('clients', 1)
            ->assertJsonPath('commercials_active', 1)
            ->assertJsonPath('quotes', 2)
            ->assertJsonPath('orders', 2)
            ->assertJsonPath('revenue', 1200)
            ->assertJsonPath('collected', 450);

        $this->getJson('/api/admin/commercials')->assertOk()
            ->assertJsonPath('data.0.quotes_count', 1)
            ->assertJsonPath('data.0.orders_count', 1)
            ->assertJsonPath('data.0.conversion_rate', 100);
        $this->getJson('/api/admin/reports?period=month')
            ->assertOk()
            ->assertJsonPath('orders', 2)
            ->assertJsonPath('quotes', 2)
            ->assertJsonPath('invoices', 1)
            ->assertJsonPath('collected', 450);
        $this->get('/api/admin/reports/export?period=month&format=csv')->assertOk();
        $this->get('/api/admin/reports/export?period=month&format=pdf')->assertOk()->assertHeader('content-type', 'application/pdf');
    }

    public function test_commercial_cannot_open_admin_api_and_admin_cannot_write_sales_data(): void
    {
        $commercial = User::create([
            'name' => 'Commercial Test', 'email' => 'commercial@test.local', 'password' => bcrypt('password'),
            'role' => 'employee', 'is_active' => true, 'account_status' => 'active',
        ]);

        $this->actingAs($commercial, 'sanctum')->getJson('/api/admin/dashboard')->assertForbidden();
        $this->actingAs($this->admin, 'sanctum')->postJson('/api/documents', [])->assertForbidden();
        $this->actingAs($commercial, 'sanctum')->postJson('/api/documents', [])->assertUnprocessable();
    }

    public function test_blocking_a_commercial_records_reason_revokes_tokens_and_denies_active_session(): void
    {
        $commercial = User::create([
            'name' => 'Commercial Test', 'email' => 'commercial@test.local', 'password' => bcrypt('password'),
            'role' => 'employee', 'is_active' => true, 'account_status' => 'active',
        ]);
        $plainToken = $commercial->createToken('erp-api')->plainTextToken;

        $this->actingAs($this->admin, 'sanctum')->patchJson('/api/admin/commercials/'.$commercial->id.'/block', ['reason' => 'Contrôle de sécurité'])
            ->assertOk()->assertJsonPath('account_status', 'blocked')->assertJsonPath('account_status_reason', 'Contrôle de sécurité');
        $this->assertDatabaseMissing('personal_access_tokens', ['tokenable_id' => $commercial->id]);
        $this->assertDatabaseHas('activity_logs', ['action' => 'commercial_blocked', 'model_id' => $commercial->id]);

        Auth::forgetGuards();
        $this->withToken($plainToken)->getJson('/api/user')->assertUnauthorized();
        $this->postJson('/api/login', ['email' => $commercial->email, 'password' => 'password'])->assertForbidden();

        $suspended = User::create([
            'name' => 'Suspended Test', 'email' => 'suspended@test.local', 'password' => bcrypt('password'),
            'role' => 'employee', 'is_active' => true, 'account_status' => 'active',
        ]);
        $suspendedToken = $suspended->createToken('erp-api')->plainTextToken;
        $this->actingAs($this->admin, 'sanctum')->patchJson('/api/admin/commercials/'.$suspended->id.'/suspend', ['reason' => 'Fin de mission'])
            ->assertOk()->assertJsonPath('account_status', 'suspended');

        Auth::forgetGuards();
        $this->withToken($suspendedToken)->getJson('/api/user')->assertUnauthorized();

        $orphanedToken = $suspended->fresh()->createToken('test-orphaned-session')->plainTextToken;
        Auth::forgetGuards();
        $this->withToken($orphanedToken)->getJson('/api/user')->assertForbidden();
        Auth::forgetGuards();
        $this->withToken($orphanedToken)->getJson('/api/dashboard')->assertForbidden();
    }

    private function createAdminSchema(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id(); $table->string('name'); $table->string('email')->unique(); $table->string('password');
            $table->string('first_name')->nullable(); $table->string('last_name')->nullable(); $table->string('phone')->nullable();
            $table->string('role')->nullable(); $table->boolean('is_active')->default(true); $table->string('account_status')->default('active');
            $table->text('account_status_reason')->nullable(); $table->timestamp('last_login_at')->nullable(); $table->timestamps();
        });
        Schema::create('roles', function (Blueprint $table) { $table->id(); $table->string('name'); $table->string('guard_name')->default('api'); $table->timestamps(); });
        Schema::create('role_user', function (Blueprint $table) { $table->foreignId('user_id'); $table->foreignId('role_id'); });
        Schema::create('companies', function (Blueprint $table) { $table->id(); $table->string('name'); $table->string('email')->nullable(); $table->string('phone')->nullable(); $table->string('city')->nullable(); $table->timestamps(); });
        Schema::create('documents', function (Blueprint $table) {
            $table->id(); $table->string('reference'); $table->string('type'); $table->unsignedBigInteger('company_id')->nullable();
            $table->unsignedBigInteger('created_by')->nullable(); $table->unsignedBigInteger('parent_document_id')->nullable();
            $table->date('document_date')->nullable(); $table->date('due_date')->nullable(); $table->string('status')->nullable();
            $table->string('payment_status')->nullable(); $table->decimal('total', 12, 2)->default(0); $table->timestamps();
        });
        Schema::create('transactions', function (Blueprint $table) { $table->id(); $table->string('type'); $table->decimal('amount', 12, 2); $table->date('transaction_date')->nullable(); $table->timestamps(); });
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id(); $table->unsignedBigInteger('user_id'); $table->string('action'); $table->string('model_type');
            $table->unsignedBigInteger('model_id'); $table->text('old_values')->nullable(); $table->text('new_values')->nullable();
            $table->string('ip_address')->nullable(); $table->timestamps();
        });
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id(); $table->morphs('tokenable'); $table->string('name'); $table->string('token', 64)->unique();
            $table->text('abilities')->nullable(); $table->timestamp('last_used_at')->nullable(); $table->timestamp('expires_at')->nullable(); $table->timestamps();
        });
    }
}
