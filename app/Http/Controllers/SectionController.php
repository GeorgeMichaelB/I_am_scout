<?php

namespace App\Http\Controllers;

use App\Models\Feraa;
use App\Models\Section;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SectionController extends Controller
{
    public function index(Request $request): Response
    {
        $sections = Section::with([
            'feraas' => function ($q) {
                $q->withCount([
                    'userRoles as scouters_count' => fn ($sq) => $sq->where('role', 'scouter'),
                    'userRoles as leaders_count' => fn ($lq) => $lq->where('role', 'leader'),
                ]);
            },
            'userRoles' => function ($q) {
                $q->where('role', 'supervisor')->with('user');
            },
        ])
        ->orderBy('display_order')
        ->get();

        return Inertia::render('Sections/Index', [
            'sections' => $sections,
        ]);
    }

    public function show(Request $request, Section $section): Response
    {
        $section->load([
            'feraas.userRoles.user',
            'userRoles' => function ($q) {
                $q->where('role', 'supervisor')->with('user');
            },
        ]);

        // 1. Get eligible leaders from Gawala Boys, Gawala Girls, Morshahen Gawala, or existing leaders
        $gawalaSectionIds = Section::whereIn('slug', ['gawala-boys', 'gawala-girls', 'morshahen-gawala'])->pluck('id')->toArray();

        $eligibleLeaders = User::whereHas('roles', function ($q) use ($gawalaSectionIds) {
            $q->whereIn('section_id', $gawalaSectionIds)
              ->orWhereIn('role', ['leader', 'admin', 'super_admin', 'dev']);
        })
        ->with(['roles.section'])
        ->orderBy('full_name')
        ->get()
        ->map(function ($u) {
            $rolesDesc = $u->roles->map(function ($r) {
                return $r->role . ($r->section ? " ({$r->section->name})" : '');
            })->join(', ');

            return [
                'id' => $u->id,
                'full_name' => $u->full_name,
                'scout_id' => $u->scout_id,
                'email' => $u->email,
                'source' => $rolesDesc ?: 'Scouter',
            ];
        });

        // If not enough from Gawala, also allow selecting from all users
        $allMembers = User::orderBy('full_name')->select('id', 'full_name', 'scout_id', 'email')->get();

        return Inertia::render('Sections/Show', [
            'section' => $section,
            'eligibleLeaders' => $eligibleLeaders->isNotEmpty() ? $eligibleLeaders : $allMembers,
            'allMembers' => $allMembers,
        ]);
    }

    public function assignSupervisor(Request $request, Section $section)
    {
        $currentUser = $request->user();
        if (!in_array($currentUser->highestRole(), ['dev', 'super_admin', 'admin'])) {
            abort(403, 'Only Admins and Super Admins can assign section supervisors.');
        }

        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
        ]);

        // Remove old supervisor for this section if any
        UserRole::where('section_id', $section->id)
            ->where('role', 'supervisor')
            ->delete();

        // Assign new supervisor
        UserRole::create([
            'user_id' => $validated['user_id'],
            'role' => 'supervisor',
            'section_id' => $section->id,
            'feraa_id' => null,
        ]);

        $supervisor = User::find($validated['user_id']);

        return back()->with('success', "{$supervisor->full_name} is now the Supervisor for {$section->name}.");
    }

    public function removeSupervisor(Request $request, Section $section, User $user)
    {
        $currentUser = $request->user();
        if (!in_array($currentUser->highestRole(), ['dev', 'super_admin', 'admin'])) {
            abort(403, 'Only Admins and Super Admins can remove section supervisors.');
        }

        UserRole::where('section_id', $section->id)
            ->where('user_id', $user->id)
            ->where('role', 'supervisor')
            ->delete();

        return back()->with('success', "Supervisor removed from {$section->name}.");
    }
}
