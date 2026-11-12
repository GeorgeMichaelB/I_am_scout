<?php

namespace App\Http\Controllers;

use App\Models\Feraa;
use App\Models\Ta7der;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class Ta7derController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $highestRole = $user->highestRole();

        $query = Ta7der::with(['leader', 'feraa.section'])->latest('week_date');

        if ($highestRole === 'leader') {
            $query->where('leader_id', $user->id);
        } elseif ($highestRole === 'supervisor') {
            $sectionIds = $user->roles->where('role', 'supervisor')->pluck('section_id')->filter();
            $query->whereHas('feraa', function ($q) use ($sectionIds) {
                $q->whereIn('section_id', $sectionIds);
            });
        }

        $ta7ders = $query->paginate(15);
        $myFeraas = Feraa::whereHas('userRoles', function ($q) use ($user) {
            $q->where('user_id', $user->id)->where('role', 'leader');
        })->get();

        return Inertia::render('Ta7der/Index', [
            'ta7ders' => $ta7ders,
            'myFeraas' => $myFeraas,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'feraa_id' => ['required', 'exists:feraas,id'],
            'week_date' => ['required', 'date'],
            'content' => ['required', 'string'],
        ]);

        Ta7der::updateOrCreate([
            'leader_id' => $request->user()->id,
            'feraa_id' => $validated['feraa_id'],
            'week_date' => $validated['week_date'],
        ], [
            'content' => $validated['content'],
            'submitted_at' => Carbon::now(),
        ]);

        return back()->with('success', 'Ta7der submitted successfully.');
    }
}
