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
}
