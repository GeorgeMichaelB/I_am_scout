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

    public function test_scouter_cannot_access_scouter_directory(): void
    {
        $scouter = User::where('email', 'scouter@scout.com')->first();
        $response = $this->actingAs($scouter)->get('/users');
        $response->assertStatus(403);
    }

    public function test_scouter_can_view_own_profile_but_not_others(): void
    {
        $scouter = User::where('email', 'scouter@scout.com')->first();
        $otherUser = User::where('email', 'admin@scout.com')->first();

        // Own profile -> 200
        $response = $this->actingAs($scouter)->get("/users/{$scouter->id}");
        $response->assertStatus(200);

        // Other profile -> 403
        $responseOther = $this->actingAs($scouter)->get("/users/{$otherUser->id}");
        $responseOther->assertStatus(403);
    }

    public function test_import_template_downloads_successfully(): void
    {
        $admin = User::where('email', 'admin@scout.com')->first();
        $response = $this->actingAs($admin)->get('/users/import-template?prefix=ASH-F1');
        $response->assertStatus(200);
        $response->assertHeader('content-disposition');
    }

    public function test_multiple_supervisors_can_be_assigned_to_section(): void
    {
        $admin = User::where('email', 'admin@scout.com')->first();
        $sup1 = User::where('email', 'george@scout.com')->first();
        $sup2 = User::where('email', 'david@scout.com')->first();

        // Assign sup1 to section 1
        $this->actingAs($admin)->post('/sections/1/assign-supervisor', ['user_id' => $sup1->id]);

        // Assign sup2 to section 1 (both should remain supervisors)
        $this->actingAs($admin)->post('/sections/1/assign-supervisor', ['user_id' => $sup2->id]);

        $this->assertDatabaseHas('user_roles', [
            'user_id' => $sup1->id,
            'role' => 'supervisor',
            'section_id' => 1,
        ]);

        $this->assertDatabaseHas('user_roles', [
            'user_id' => $sup2->id,
            'role' => 'supervisor',
            'section_id' => 1,
        ]);
    }

    public function test_multiple_leaders_can_be_assigned_to_feraa(): void
    {
        $admin = User::where('email', 'admin@scout.com')->first();
        $ldr1 = User::where('email', 'george@scout.com')->first();
        $ldr2 = User::where('email', 'david@scout.com')->first();

        // Assign ldr1 to Fera'a 1
        $this->actingAs($admin)->post('/feraas/1/assign-leader', ['user_id' => $ldr1->id]);

        // Assign ldr2 to Fera'a 1
        $this->actingAs($admin)->post('/feraas/1/assign-leader', ['user_id' => $ldr2->id]);

        $this->assertDatabaseHas('user_roles', [
            'user_id' => $ldr1->id,
            'role' => 'leader',
            'feraa_id' => 1,
        ]);

        $this->assertDatabaseHas('user_roles', [
            'user_id' => $ldr2->id,
            'role' => 'leader',
            'feraa_id' => 1,
        ]);
    }

    public function test_bad_hair_checkbox_deducts_from_score(): void
    {
        $admin = User::where('email', 'admin@scout.com')->first();
        $scouter = User::where('email', 'scouter@scout.com')->first();

        $evaluation = \App\Models\WeeklyEvaluation::create([
            'feraa_id' => 1,
            'type' => 'weekly',
            'week_date' => '2026-05-01',
            'is_active' => true,
            'created_by' => $admin->id,
        ]);

        // Submit with hair = true (Bad Hair infraction)
        $this->actingAs($admin)->post("/evaluations/{$evaluation->id}/entries", [
            'entries' => [
                [
                    'scouter_id' => $scouter->id,
                    'hair' => true,
                    'trousers' => false,
                    'clothes' => false,
                    'rope' => false,
                    'missed_lectures' => 0,
                ],
            ],
        ]);

        $this->assertDatabaseHas('evaluation_entries', [
            'evaluation_id' => $evaluation->id,
            'scouter_id' => $scouter->id,
            'hair' => 1,
            'score' => 85, // 100 - 15 = 85
        ]);
    }

    public function test_camp_evaluation_can_be_created_and_scored(): void
    {
        $admin = User::where('email', 'admin@scout.com')->first();

        $response = $this->actingAs($admin)->post('/evaluations', [
            'feraa_id' => 1,
            'type' => 'camp',
            'camp_name' => 'Annual Summer Camp',
            'week_date' => '2026-07-15',
            'is_active' => true,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('weekly_evaluations', [
            'type' => 'camp',
            'camp_name' => 'Annual Summer Camp',
        ]);
    }

    public function test_supervisor_can_toggle_leader_evaluation_access(): void
    {
        $supervisor = User::where('email', 'supervisor@scout.com')->first();
        $leader = User::where('email', 'leader@scout.com')->first();
        $leaderRole = $leader->roles->where('role', 'leader')->first();

        // Supervisor toggles weekly evaluation access to false
        $this->actingAs($supervisor)->post("/evaluations/toggle-leader-access/{$leaderRole->id}", [
            'access_type' => 'weekly',
        ]);

        $this->assertFalse((bool)$leaderRole->fresh()->can_evaluate_weekly);

        // Leader attempts to create a weekly evaluation -> 403 Forbidden
        $response = $this->actingAs($leader)->post('/evaluations', [
            'feraa_id' => $leaderRole->feraa_id,
            'type' => 'weekly',
            'week_date' => '2026-05-10',
            'is_active' => true,
        ]);

        $response->assertStatus(403);
    }
}
