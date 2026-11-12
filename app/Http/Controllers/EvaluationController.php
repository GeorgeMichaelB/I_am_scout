<?php

namespace App\Http\Controllers;

use App\Models\EvaluationEntry;
use App\Models\Feraa;
use App\Models\Section;
use App\Models\User;
use App\Models\UserRole;
use App\Models\WeeklyEvaluation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EvaluationController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $highestRole = $user->highestRole();

        $query = WeeklyEvaluation::with(['feraa.section', 'author', 'entries.scouter'])
            ->latest('week_date');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $canWeekly = true;
        $canCamp = true;
        $leaderSectionLeaders = [];

        if ($highestRole === 'leader') {
            $leaderRoles = $user->roles->where('role', 'leader');
            $feraaIds = $leaderRoles->pluck('feraa_id')->filter();
            $query->whereIn('feraa_id', $feraaIds);

            // Access permissions set by supervisor
            $canWeekly = (bool) $leaderRoles->contains('can_evaluate_weekly', true);
            $canCamp = (bool) $leaderRoles->contains('can_evaluate_camp', true);
        } elseif ($highestRole === 'supervisor') {
            $sectionIds = $user->roles->where('role', 'supervisor')->pluck('section_id')->filter();
            $query->whereHas('feraa', function ($q) use ($sectionIds) {
                $q->whereIn('section_id', $sectionIds);
            });

            // Fetch leaders under supervisor's sections for access toggles
            $leaderSectionLeaders = UserRole::whereIn('section_id', $sectionIds)
                ->where('role', 'leader')
                ->with(['user', 'section', 'feraa'])
                ->get()
                ->map(function ($r) {
                    return [
                        'id' => $r->id,
                        'user_id' => $r->user_id,
                        'full_name' => $r->user?->full_name,
                        'scout_id' => $r->user?->scout_id,
                        'section_name' => $r->section?->name,
                        'feraa_name' => $r->feraa?->name,
                        'can_evaluate_weekly' => (bool) $r->can_evaluate_weekly,
                        'can_evaluate_camp' => (bool) $r->can_evaluate_camp,
                    ];
                });
        } elseif (in_array($highestRole, ['dev', 'super_admin', 'admin'])) {
            // Admins can see access toggles for all leaders
            $leaderSectionLeaders = UserRole::where('role', 'leader')
                ->with(['user', 'section', 'feraa'])
                ->get()
                ->map(function ($r) {
                    return [
                        'id' => $r->id,
                        'user_id' => $r->user_id,
                        'full_name' => $r->user?->full_name,
                        'scout_id' => $r->user?->scout_id,
                        'section_name' => $r->section?->name,
                        'feraa_name' => $r->feraa?->name,
                        'can_evaluate_weekly' => (bool) $r->can_evaluate_weekly,
                        'can_evaluate_camp' => (bool) $r->can_evaluate_camp,
                    ];
                });
        }

        $evaluations = $query->paginate(15)->withQueryString();

        // Feraas available for new evaluation
        if ($highestRole === 'leader') {
            $feraaIds = $user->roles->where('role', 'leader')->pluck('feraa_id')->filter();
            $feraas = Feraa::whereIn('id', $feraaIds)->with('section')->get();
        } elseif ($highestRole === 'supervisor') {
            $sectionIds = $user->roles->where('role', 'supervisor')->pluck('section_id')->filter();
            $feraas = Feraa::whereIn('section_id', $sectionIds)->with('section')->get();
        } else {
            $feraas = Feraa::with('section')->get();
        }

        return Inertia::render('Evaluations/Index', [
            'evaluations' => $evaluations,
            'feraas' => $feraas,
            'canWeekly' => $canWeekly,
            'canCamp' => $canCamp,
            'leaderSectionLeaders' => $leaderSectionLeaders,
            'currentFilter' => $request->only(['type']),
        ]);
    }

    public function store(Request $request)
    {
        $currentUser = $request->user();
        $highestRole = $currentUser->highestRole();
        $isSupervisorOrAbove = in_array($highestRole, ['dev', 'super_admin', 'admin', 'supervisor']);

        // Allow supervisors and admins to generate camp evaluations for all Fera'as at once
        if ($request->input('feraa_id') === 'all' && $isSupervisorOrAbove) {
            $validated = $request->validate([
                'type' => ['required', 'in:weekly,camp'],
                'camp_name' => ['nullable', 'string', 'max:255'],
                'week_date' => ['required', 'date'],
                'is_active' => ['boolean'],
                'section_id' => ['nullable', 'exists:sections,id'],
            ]);

            $feraasQuery = Feraa::query();
            if ($highestRole === 'supervisor') {
                $secIds = $currentUser->roles()->where('role', 'supervisor')->pluck('section_id')->filter();
                $feraasQuery->whereIn('section_id', $secIds);
            } elseif ($request->filled('section_id')) {
                $feraasQuery->where('section_id', $request->section_id);
            }

            $targetFeraas = $feraasQuery->get();
            foreach ($targetFeraas as $f) {
                WeeklyEvaluation::firstOrCreate([
                    'feraa_id' => $f->id,
                    'type' => $validated['type'],
                    'week_date' => $validated['week_date'],
                ], [
                    'camp_name' => $validated['type'] === 'camp' ? ($validated['camp_name'] ?: 'Scout Camp') : null,
                    'is_active' => $validated['is_active'] ?? true,
                    'created_by' => $currentUser->id,
                ]);
            }

            $campTitle = $validated['camp_name'] ?: 'Camp';
            return redirect()->route('evaluations.index')->with('success', "{$campTitle} evaluations created for all {$targetFeraas->count()} Fera'as.");
        }

        $validated = $request->validate([
            'feraa_id' => ['required', 'exists:feraas,id'],
            'type' => ['required', 'in:weekly,camp'],
            'camp_name' => ['nullable', 'string', 'max:255'],
            'week_date' => ['required', 'date'],
            'is_active' => ['boolean'],
        ]);

        // Permission check if user is a leader
        if ($highestRole === 'leader') {
            $leaderRole = $currentUser->roles()
                ->where('role', 'leader')
                ->where('feraa_id', $validated['feraa_id'])
                ->first();

            if (!$leaderRole) {
                abort(403, 'You are not assigned as a leader to this Fera\'a.');
            }

            if ($validated['type'] === 'weekly' && !$leaderRole->can_evaluate_weekly) {
                abort(403, 'Weekly evaluation access for your Fera\'a has been restricted by your Section Supervisor.');
            }

            if ($validated['type'] === 'camp' && !$leaderRole->can_evaluate_camp) {
                abort(403, 'Camp evaluation access for your Fera\'a has been restricted by your Section Supervisor.');
            }
        }

        $evaluation = WeeklyEvaluation::create([
            'feraa_id' => $validated['feraa_id'],
            'type' => $validated['type'],
            'camp_name' => $validated['type'] === 'camp' ? ($validated['camp_name'] ?: 'Scout Camp') : null,
            'week_date' => $validated['week_date'],
            'is_active' => $validated['is_active'] ?? true,
            'created_by' => $currentUser->id,
        ]);

        $label = $validated['type'] === 'camp' ? 'Camp' : 'Weekly';

        return redirect()->route('evaluations.show', $evaluation)->with('success', "{$label} evaluation sheet created successfully.");
    }

    public function show(Request $request, WeeklyEvaluation $evaluation): Response
    {
        $currentUser = $request->user();
        $highestRole = $currentUser->highestRole();

        // Access check for leaders
        $isRestricted = false;
        if ($highestRole === 'leader') {
            $leaderRole = $currentUser->roles()
                ->where('role', 'leader')
                ->where('feraa_id', $evaluation->feraa_id)
                ->first();

            if ($leaderRole) {
                if ($evaluation->type === 'weekly' && !$leaderRole->can_evaluate_weekly) {
                    $isRestricted = true;
                }
                if ($evaluation->type === 'camp' && !$leaderRole->can_evaluate_camp) {
                    $isRestricted = true;
                }
            }
        }

        $evaluation->load(['feraa.section', 'author', 'entries.scouter']);

        // Fetch all scouters in this Fera'a
        $scouters = User::whereHas('roles', function ($q) use ($evaluation) {
            $q->where('role', 'scouter')->where('feraa_id', $evaluation->feraa_id);
        })->orderBy('full_name')->get();

        // Ensure every scouter has an entry or placeholder
        $existingEntries = $evaluation->entries->keyBy('scouter_id');
        $scouterEntries = $scouters->map(function ($scouter) use ($existingEntries, $evaluation) {
            $entry = $existingEntries->get($scouter->id);
            $hair = $entry ? (bool)$entry->hair : false;
            $trousers = $entry ? (bool)$entry->trousers : false;
            $clothes = $entry ? (bool)$entry->clothes : false;
            $rope = $entry ? (bool)$entry->rope : false;
            $tentBad = $entry ? (bool)$entry->tent_bad : false;
            $missedLectures = $entry ? (int)$entry->missed_lectures : 0;

            // Calculate live score
            if ($evaluation->type === 'camp') {
                $score = max(0, 100 - ($hair ? 15 : 0) - ($clothes ? 20 : 0) - ($tentBad ? 20 : 0) - ($rope ? 15 : 0) - ($missedLectures * 15));
            } else {
                $score = max(0, 100 - ($hair ? 15 : 0) - ($trousers ? 15 : 0) - ($clothes ? 20 : 0) - ($rope ? 10 : 0) - ($missedLectures * 10));
            }

            return [
                'scouter_id' => $scouter->id,
                'scout_id' => $scouter->scout_id,
                'full_name' => $scouter->full_name,
                'hair' => $hair,
                'trousers' => $trousers,
                'clothes' => $clothes,
                'rope' => $rope,
                'tent_bad' => $tentBad,
                'missed_lectures' => $missedLectures,
                'score' => $entry && $entry->score !== null ? (int)$entry->score : $score,
                'notes' => $entry ? (string)$entry->notes : '',
            ];
        });

        return Inertia::render('Evaluations/Show', [
            'evaluation' => $evaluation,
            'scouterEntries' => $scouterEntries,
            'isRestricted' => $isRestricted,
        ]);
    }

    public function toggleActive(WeeklyEvaluation $evaluation)
    {
        $evaluation->update([
            'is_active' => !$evaluation->is_active,
        ]);

        $status = $evaluation->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "Evaluation is now {$status}.");
    }

    public function storeEntry(Request $request, WeeklyEvaluation $evaluation)
    {
        $currentUser = $request->user();
        $highestRole = $currentUser->highestRole();

        // Check if leader has write permission
        if ($highestRole === 'leader') {
            $leaderRole = $currentUser->roles()
                ->where('role', 'leader')
                ->where('feraa_id', $evaluation->feraa_id)
                ->first();

            if (!$leaderRole) {
                abort(403, 'Unauthorized.');
            }

            if ($evaluation->type === 'weekly' && !$leaderRole->can_evaluate_weekly) {
                abort(403, 'Evaluation access has been locked by your Section Supervisor.');
            }

            if ($evaluation->type === 'camp' && !$leaderRole->can_evaluate_camp) {
                abort(403, 'Camp evaluation access has been locked by your Section Supervisor.');
            }
        }

        $validated = $request->validate([
            'entries' => ['required', 'array'],
            'entries.*.scouter_id' => ['required', 'exists:users,id'],
            'entries.*.hair' => ['boolean'],
            'entries.*.trousers' => ['boolean'],
            'entries.*.clothes' => ['boolean'],
            'entries.*.rope' => ['boolean'],
            'entries.*.tent_bad' => ['boolean'],
            'entries.*.missed_lectures' => ['integer', 'min:0'],
            'entries.*.notes' => ['nullable', 'string', 'max:500'],
        ]);

        foreach ($validated['entries'] as $entryData) {
            $hair = !empty($entryData['hair']);
            $trousers = !empty($entryData['trousers']);
            $clothes = !empty($entryData['clothes']);
            $rope = !empty($entryData['rope']);
            $tentBad = !empty($entryData['tent_bad']);
            $missedLectures = (int)($entryData['missed_lectures'] ?? 0);

            if ($evaluation->type === 'camp') {
                $score = max(0, 100 - ($hair ? 15 : 0) - ($clothes ? 20 : 0) - ($tentBad ? 20 : 0) - ($rope ? 15 : 0) - ($missedLectures * 15));
            } else {
                $score = max(0, 100 - ($hair ? 15 : 0) - ($trousers ? 15 : 0) - ($clothes ? 20 : 0) - ($rope ? 10 : 0) - ($missedLectures * 10));
            }

            EvaluationEntry::updateOrCreate(
                [
                    'evaluation_id' => $evaluation->id,
                    'scouter_id' => $entryData['scouter_id'],
                ],
                [
                    'hair' => $hair,
                    'trousers' => $trousers,
                    'clothes' => $clothes,
                    'rope' => $rope,
                    'tent_bad' => $tentBad,
                    'missed_lectures' => $missedLectures,
                    'score' => $score,
                    'notes' => $entryData['notes'] ?? null,
                ]
            );
        }

        return back()->with('success', 'Evaluations and scores saved successfully.');
    }

    public function toggleLeaderAccess(Request $request, ?UserRole $userRole = null)
    {
        if (!$userRole) {
            $roleId = $request->input('leader_role_id') ?? $request->input('user_role_id');
            $userRole = UserRole::findOrFail($roleId);
        }

        $currentUser = $request->user();
        $highestRole = $currentUser->highestRole();

        $isSupervisor = $currentUser->hasRole('supervisor', $userRole->section_id);
        $isAdminOrSuper = in_array($highestRole, ['dev', 'super_admin', 'admin']);

        if (!$isSupervisor && !$isAdminOrSuper) {
            abort(403, 'Only the Section Supervisor or Admin can toggle evaluation access.');
        }

        $validated = $request->validate([
            'access_type' => ['required', 'in:weekly,camp,all'],
        ]);

        $userName = $userRole->user?->full_name ?? 'Leader';

        if ($validated['access_type'] === 'weekly') {
            $userRole->update(['can_evaluate_weekly' => !$userRole->can_evaluate_weekly]);
            $status = $userRole->can_evaluate_weekly ? 'enabled' : 'restricted';
            $msg = "Weekly evaluation access {$status} for {$userName}.";
        } elseif ($validated['access_type'] === 'camp') {
            $userRole->update(['can_evaluate_camp' => !$userRole->can_evaluate_camp]);
            $status = $userRole->can_evaluate_camp ? 'enabled' : 'restricted';
            $msg = "Camp evaluation access {$status} for {$userName}.";
        } else {
            $newVal = !($userRole->can_evaluate_weekly && $userRole->can_evaluate_camp);
            $userRole->update([
                'can_evaluate_weekly' => $newVal,
                'can_evaluate_camp' => $newVal,
            ]);
            $status = $newVal ? 'enabled' : 'restricted';
            $msg = "All evaluation access {$status} for {$userName}.";
        }

        return back()->with('success', $msg);
    }
}
