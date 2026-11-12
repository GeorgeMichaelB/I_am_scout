<?php

namespace App\Http\Controllers;

use App\Exports\ScouterTemplateExport;
use App\Imports\ScouterImport;
use App\Models\Feraa;
use App\Models\Section;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $currentUser = $request->user();
        $highestRole = $currentUser->highestRole();

        // Scouters are strictly forbidden from viewing the scouters list
        if ($highestRole === 'scouter') {
            abort(403, 'Scouters are not authorized to view the member directory.');
        }

        $query = User::with(['roles.section', 'roles.feraa']);

        // Scope data access based on role
        if ($highestRole === 'leader') {
            $leaderFeraaIds = $currentUser->roles->where('role', 'leader')->pluck('feraa_id')->filter();
            $query->whereHas('roles', function ($q) use ($leaderFeraaIds) {
                $q->whereIn('feraa_id', $leaderFeraaIds);
            });
        } elseif ($highestRole === 'supervisor') {
            $supervisorSectionIds = $currentUser->roles->where('role', 'supervisor')->pluck('section_id')->filter();
            $query->whereHas('roles', function ($q) use ($supervisorSectionIds) {
                $q->whereIn('section_id', $supervisorSectionIds);
            });
        }

        // Search & Filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('scout_id', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('section_id')) {
            $query->whereHas('roles', function ($q) use ($request) {
                $q->where('section_id', $request->section_id);
            });
        }

        if ($request->filled('feraa_id')) {
            $query->whereHas('roles', function ($q) use ($request) {
                $q->where('feraa_id', $request->feraa_id);
            });
        }

        if ($request->filled('role')) {
            $query->whereHas('roles', function ($q) use ($request) {
                $q->where('role', $request->role);
            });
        }

        $users = $query->paginate(20)->withQueryString();
        $sections = Section::with('feraas')->orderBy('display_order')->get();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'sections' => $sections,
            'filters' => $request->only(['search', 'section_id', 'feraa_id', 'role']),
        ]);
    }

    public function create(Request $request): Response
    {
        $sections = Section::with('feraas')->orderBy('display_order')->get();
        return Inertia::render('Users/Create', [
            'sections' => $sections,
        ]);
    }

    public function store(Request $request)
    {
        $currentUser = $request->user();
        if (!in_array($currentUser->highestRole(), ['dev', 'super_admin', 'admin'])) {
            abort(403, 'Only admins can create accounts.');
        }

        $validated = $request->validate([
            'scout_id' => ['nullable', 'string', 'unique:users,scout_id'],
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['nullable', 'string', 'min:6'],
            'gender' => ['required', 'in:male,female'],
            'phone' => ['nullable', 'string'],
            'mom_phone' => ['nullable', 'string'],
            'dad_phone' => ['nullable', 'string'],
            'school' => ['nullable', 'string'],
            'grade' => ['nullable', 'string'],
            'sunday_school_family' => ['nullable', 'string'],
            'address' => ['nullable', 'string'],
            'diseases' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'role' => ['required', 'in:dev,super_admin,admin,supervisor,leader,scouter'],
            'section_id' => ['nullable', 'exists:sections,id'],
            'feraa_id' => ['nullable', 'exists:feraas,id'],
        ]);

        $password = !empty($validated['password']) ? Hash::make($validated['password']) : Hash::make('password');

        $user = User::create([
            'scout_id' => $validated['scout_id'] ?? null,
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'password' => $password,
            'gender' => $validated['gender'],
            'phone' => $validated['phone'] ?? null,
            'mom_phone' => $validated['mom_phone'] ?? null,
            'dad_phone' => $validated['dad_phone'] ?? null,
            'school' => $validated['school'] ?? null,
            'grade' => $validated['grade'] ?? null,
            'sunday_school_family' => $validated['sunday_school_family'] ?? null,
            'address' => $validated['address'] ?? null,
            'diseases' => $validated['diseases'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        UserRole::create([
            'user_id' => $user->id,
            'role' => $validated['role'],
            'section_id' => $validated['section_id'] ?? null,
            'feraa_id' => $validated['feraa_id'] ?? null,
        ]);

        return redirect()->route('users.index')->with('success', 'User created successfully.');
    }

    public function show(Request $request, User $user): Response
    {
        $currentUser = $request->user();
        $highestRole = $currentUser->highestRole();

        // Scouters can only view their own profile
        if ($highestRole === 'scouter' && $currentUser->id !== $user->id) {
            abort(403, 'Unauthorized to view this profile.');
        }

        $user->load(['roles.section', 'roles.feraa']);
        $sections = Section::with('feraas')->orderBy('display_order')->get();

        return Inertia::render('Users/Show', [
            'scouter' => $user,
            'sections' => $sections,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $currentUser = $request->user();
        $highestRole = $currentUser->highestRole();

        // Leaders can update their scouters data
        $isLeaderOfUser = false;
        if ($highestRole === 'leader') {
            $leaderFeraaIds = $currentUser->roles->where('role', 'leader')->pluck('feraa_id')->toArray();
            $userFeraaIds = $user->roles->pluck('feraa_id')->toArray();
            $isLeaderOfUser = count(array_intersect($leaderFeraaIds, $userFeraaIds)) > 0;
        }

        if (!in_array($highestRole, ['dev', 'super_admin', 'admin', 'supervisor']) && !$isLeaderOfUser && $currentUser->id !== $user->id) {
            abort(403, 'Unauthorized to update this user.');
        }

        $validated = $request->validate([
            'scout_id' => ['nullable', 'string', 'unique:users,scout_id,' . $user->id],
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email,' . $user->id],
            'phone' => ['nullable', 'string'],
            'mom_phone' => ['nullable', 'string'],
            'dad_phone' => ['nullable', 'string'],
            'school' => ['nullable', 'string'],
            'grade' => ['nullable', 'string'],
            'gender' => ['required', 'in:male,female'],
            'sunday_school_family' => ['nullable', 'string'],
            'address' => ['nullable', 'string'],
            'diseases' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ]);

        $user->update($validated);

        return back()->with('success', 'User information updated successfully.');
    }

    public function destroy(Request $request, User $user)
    {
        $currentUser = $request->user();
        if (!in_array($currentUser->highestRole(), ['dev', 'super_admin', 'admin'])) {
            abort(403, 'Only admins can delete accounts.');
        }

        if ($user->id === $currentUser->id) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return redirect()->route('users.index')->with('success', 'User deleted successfully.');
    }

    public function importTemplate(Request $request)
    {
        $prefix = $request->query('prefix', 'ASH-F1');
        return Excel::download(new ScouterTemplateExport($prefix), 'scouters_template.xlsx');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv'],
            'section_id' => ['nullable', 'exists:sections,id'],
            'feraa_id' => ['nullable', 'exists:feraas,id'],
        ]);

        $importer = new ScouterImport($request->section_id, $request->feraa_id);
        Excel::import($importer, $request->file('file'));

        return back()->with('success', "Successfully imported {$importer->importedCount} scouters.");
    }
}

