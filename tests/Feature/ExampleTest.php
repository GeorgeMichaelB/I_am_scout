<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $response = $this->get('/');
        $response->assertRedirect('/login');
    }

    public function test_login_page_loads_successfully(): void
    {
        $response = $this->get('/login');
        $response->assertStatus(200);
    }

    public function test_authenticated_user_can_access_dashboard(): void
    {
        $user = User::where('email', 'admin@scout.com')->first();
        $response = $this->actingAs($user)->get('/');
        $response->assertStatus(200);
    }

    public function test_sections_are_available(): void
    {
        $user = User::where('email', 'admin@scout.com')->first();
        $response = $this->actingAs($user)->get('/sections');
        $response->assertStatus(200);
    }

    public function test_scouter_directory_is_accessible(): void
    {
        $user = User::where('email', 'leader@scout.com')->first();
        $response = $this->actingAs($user)->get('/users');
        $response->assertStatus(200);
    }

    public function test_admin_can_access_roles_and_authority_center(): void
    {
        $admin = User::where('email', 'admin@scout.com')->first();
        $response = $this->actingAs($admin)->get('/roles');
        $response->assertStatus(200);
    }

    public function test_admin_can_assign_section_supervisor(): void
    {
        $admin = User::where('email', 'admin@scout.com')->first();
        $targetUser = User::where('email', 'george@scout.com')->first();

        $response = $this->actingAs($admin)->post('/sections/1/assign-supervisor', [
            'user_id' => $targetUser->id,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('user_roles', [
            'user_id' => $targetUser->id,
            'role' => 'supervisor',
            'section_id' => 1,
        ]);
    }

    public function test_admin_can_assign_feraa_leader(): void
    {
        $admin = User::where('email', 'admin@scout.com')->first();
        $targetUser = User::where('email', 'david@scout.com')->first();

        $response = $this->actingAs($admin)->post('/feraas/1/assign-leader', [
            'user_id' => $targetUser->id,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('user_roles', [
            'user_id' => $targetUser->id,
            'role' => 'leader',
            'feraa_id' => 1,
        ]);
    }

    public function test_scouter_cannot_access_roles_page(): void
    {
        $scouter = User::where('email', 'scouter@scout.com')->first();
        $response = $this->actingAs($scouter)->get('/roles');
        $response->assertStatus(403);
    }

    public function test_shared_inertia_auth_props_have_highest_role(): void
    {
        $admin = User::where('email', 'admin@scout.com')->first();
        $response = $this->actingAs($admin)->get('/');
        $response->assertStatus(200);

        $page = $response->viewData('page');
        $this->assertEquals('admin', $page['props']['auth']['user']['highestRole']);
        $this->assertEquals('admin', $page['props']['auth']['user']['highest_role']);
        $this->assertTrue($page['props']['auth']['user']['isAdmin']);
    }

    public function test_super_admin_can_upgrade_account_rank(): void
    {
        $superAdmin = User::where('email', 'superadmin@scout.com')->first();
        $targetUser = User::where('email', 'mark@scout.com')->first();

        $response = $this->actingAs($superAdmin)->post("/roles/upgrade-downgrade/{$targetUser->id}", [
            'role' => 'admin',
            'action' => 'replace_all',
        ]);

        $response->assertSessionHas('success');
        $this->assertEquals('admin', $targetUser->fresh()->highestRole());
    }

    public function test_admin_cannot_promote_to_super_admin(): void
    {
        $admin = User::where('email', 'admin@scout.com')->first();
        $targetUser = User::where('email', 'mark@scout.com')->first();

        $response = $this->actingAs($admin)->post("/roles/upgrade-downgrade/{$targetUser->id}", [
            'role' => 'super_admin',
            'action' => 'replace_all',
        ]);

        $response->assertSessionHas('error');
    }

    public function test_supervisor_can_assign_leader_in_their_section(): void
    {
        $supervisor = User::where('email', 'supervisor@scout.com')->first();
        $targetUser = User::where('email', 'david@scout.com')->first();

        // supervisor@scout.com is supervisor of Ashbal (section 1), Fera'a 1 is in section 1
        $response = $this->actingAs($supervisor)->post('/feraas/1/assign-leader', [
            'user_id' => $targetUser->id,
        ]);

        $response->assertSessionHas('success');
    }
}
