<?php

namespace App\Http\Controllers;

use App\Models\EvaluationEntry;
use App\Models\Feraa;
use App\Models\Section;
use App\Models\User;
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

        if ($highestRole === 'leader') {
            $feraaIds = $user->roles->where('role', 'leader')->pluck('feraa_id')->filter();
            $query->whereIn('feraa_id', $feraaIds);
        } elseif ($highestRole === 'supervisor') {
            $sectionIds = $user->roles->where('role', 'supervisor')->pluck('section_id')->filter();
            $query->whereHas('feraa', function ($q) use ($sectionIds) {
                $q->whereIn('section_id', $sectionIds);
            });
        }

        $evaluations = $query->paginate(15);
        $feraas = Feraa::with('section')->get();

        return Inertia::render('Evaluations/Index', [
            'evaluations' => $evaluations,
            'feraas' => $feraas,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'feraa_id' => ['required', 'exists:feraas,id'],
            'week_date' => ['required', 'date'],
            'is_active' => ['boolean'],
        ]);

        $evaluation = WeeklyEvaluation::firstOrCreate([
            'feraa_id' => $validated['feraa_id'],
            'week_date' => $validated['week_date'],
        ], [
            'is_active' => $validated['is_active'] ?? true,
            'created_by' => $request->user()->id,
        ]);

        return redirect()->route('evaluations.show', $evaluation)->with('success', 'Weekly evaluation sheet created.');
    }

    public function show(WeeklyEvaluation $evaluation): Response
    {
        $evaluation->load(['feraa.section', 'author', 'entries.scouter']);

        // Fetch all scouters in this Fera'a
        $scouters = User::whereHas('roles', function ($q) use ($evaluation) {
            $q->where('role', 'scouter')->where('feraa_id', $evaluation->feraa_id);
        })->get();

        // Ensure every scouter has an entry or placeholder
        $existingEntries = $evaluation->entries->keyBy('scouter_id');
        $scouterEntries = $scouters->map(function ($scouter) use ($existingEntries) {
            $entry = $existingEntries->get($scouter->id);
            return [
                'scouter_id' => $scouter->id,
                'scout_id' => $scouter->scout_id,
                'full_name' => $scouter->full_name,
                'hair' => $entry ? (bool)$entry->hair : false,
                'trousers' => $entry ? (bool)$entry->trousers : false,
                'clothes' => $entry ? (bool)$entry->clothes : false,
                'rope' => $entry ? (bool)$entry->rope : false,
                'missed_lectures' => $entry ? (int)$entry->missed_lectures : 0,
            ];
        });

        return Inertia::render('Evaluations/Show', [
            'evaluation' => $evaluation,
            'scouterEntries' => $scouterEntries,
        ]);
    }

    public function toggleActive(WeeklyEvaluation $evaluation)
    {
        $evaluation->update([
            'is_active' => !$evaluation->is_active,
        ]);

        $status = $evaluation->is_active ? 'activated' : 'deactivated';
        return back()->with('success', "Weekly evaluation is now {$status}.");
    }

    public function storeEntry(Request $request, WeeklyEvaluation $evaluation)
    {
        $validated = $request->validate([
            'entries' => ['required', 'array'],
            'entries.*.scouter_id' => ['required', 'exists:users,id'],
            'entries.*.hair' => ['boolean'],
            'entries.*.trousers' => ['boolean'],
            'entries.*.clothes' => ['boolean'],
            'entries.*.rope' => ['boolean'],
            'entries.*.missed_lectures' => ['integer', 'min:0'],
        ]);

        foreach ($validated['entries'] as $entryData) {
            EvaluationEntry::updateOrCreate(
                [
                    'evaluation_id' => $evaluation->id,
                    'scouter_id' => $entryData['scouter_id'],
                ],
                [
                    'hair' => $entryData['hair'] ?? false,
                    'trousers' => $entryData['trousers'] ?? false,
                    'clothes' => $entryData['clothes'] ?? false,
                    'rope' => $entryData['rope'] ?? false,
                    'missed_lectures' => $entryData['missed_lectures'] ?? 0,
                ]
            );
        }

        return back()->with('success', 'Evaluations saved successfully.');
    }
}
