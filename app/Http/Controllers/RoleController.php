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
        $currentUser = $request->user();
        if (!in_array($currentUser->highestRole(), ['dev', 'super_admin'])) {
            abort(403, 'Only Super Admin can access the Role & Account Authority Center.');
        }

        $query = User::with(['roles.section', 'roles.feraa'])->orderBy('full_name');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('scout_id', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->whereHas('roles', fn ($q) => $q->where('role', $request->role));
        }

        $users = $query->paginate(25)->withQueryString();
        $sections = Section::with('feraas')->orderBy('display_order')->get();

        return Inertia::render('Roles/Index', [
            'users' => $users,
            'sections' => $sections,
            'filters' => $request->only(['search', 'role']),
        ]);
    }

    public function store(Request $request)
    {
        $currentUser = $request->user();
        if (!in_array($currentUser->highestRole(), ['dev', 'super_admin'])) {
            abort(403, 'Only Super Admin can assign roles.');
        }

        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'role' => ['required', 'in:dev,super_admin,admin,supervisor,leader,scouter'],
            'section_id' => ['nullable', 'exists:sections,id'],
            'feraa_id' => ['nullable', 'exists:feraas,id'],
        ]);

        $role = UserRole::firstOrCreate([
            'user_id' => $validated['user_id'],
            'role' => $validated['role'],
            'section_id' => $validated['section_id'] ?? null,
            'feraa_id' => $validated['feraa_id'] ?? null,
        ]);

        $user = User::find($validated['user_id']);

        return back()->with('success', "Role '{$validated['role']}' added to {$user->full_name}.");
    }

    public function upgradeDowngrade(Request $request, User $user)
    {
        $currentUser = $request->user();
        if (!in_array($currentUser->highestRole(), ['dev', 'super_admin'])) {
            abort(403, 'Only Super Admin can upgrade or downgrade accounts.');
        }

        $validated = $request->validate([
            'role' => ['required', 'in:dev,super_admin,admin,supervisor,leader,scouter'],
            'section_id' => ['nullable', 'exists:sections,id'],
            'feraa_id' => ['nullable', 'exists:feraas,id'],
            'action' => ['required', 'in:replace_all,add'],
        ]);

        if ($validated['action'] === 'replace_all') {
            // Replace all existing roles with this new rank
            $user->roles()->delete();
        }

        UserRole::firstOrCreate([
            'user_id' => $user->id,
            'role' => $validated['role'],
            'section_id' => $validated['section_id'] ?? null,
            'feraa_id' => $validated['feraa_id'] ?? null,
        ]);

        return back()->with('success', "Account {$user->full_name} status updated to '{$validated['role']}'.");
    }

    public function destroy(Request $request, UserRole $userRole)
    {
        $currentUser = $request->user();
        if (!in_array($currentUser->highestRole(), ['dev', 'super_admin'])) {
            abort(403, 'Only Super Admin can remove roles.');
        }

        $userName = $userRole->user?->full_name;
        $roleName = $userRole->role;
        $userRole->delete();

        return back()->with('success', "Role '{$roleName}' removed from {$userName}.");
    }
}
