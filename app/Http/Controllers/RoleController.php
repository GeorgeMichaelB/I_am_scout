<?php

namespace App\Http\Controllers;

use App\Models\Feraa;
use App\Models\Section;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::with(['roles.section', 'roles.feraa'])
            ->orderBy('full_name')
            ->paginate(25);

        $sections = Section::with('feraas')->orderBy('display_order')->get();

        return Inertia::render('Roles/Index', [
            'users' => $users,
            'sections' => $sections,
        ]);
    }

    public function store(Request $request)
    {
        $currentUser = $request->user();
        if (!in_array($currentUser->highestRole(), ['dev', 'super_admin'])) {
            abort(403, 'Only Super Admin can assign or modify roles.');
        }

        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'role' => ['required', 'in:dev,super_admin,admin,supervisor,leader,scouter'],
            'section_id' => ['nullable', 'exists:sections,id'],
            'feraa_id' => ['nullable', 'exists:feraas,id'],
        ]);

        UserRole::firstOrCreate([
            'user_id' => $validated['user_id'],
            'role' => $validated['role'],
            'section_id' => $validated['section_id'] ?? null,
            'feraa_id' => $validated['feraa_id'] ?? null,
        ]);

        return back()->with('success', 'Role added to user successfully.');
    }

    public function destroy(Request $request, UserRole $userRole)
    {
        $currentUser = $request->user();
        if (!in_array($currentUser->highestRole(), ['dev', 'super_admin'])) {
            abort(403, 'Only Super Admin can remove roles.');
        }

        $userRole->delete();

        return back()->with('success', 'Role removed successfully.');
    }
}

