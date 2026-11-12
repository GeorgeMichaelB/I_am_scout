<?php

namespace App\Http\Controllers;

use App\Models\Feraa;
use App\Models\Lecture;
use App\Models\Section;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LectureController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $highestRole = $user->highestRole();

        $query = Lecture::with(['section', 'feraa', 'author'])->latest('week_date');

        if ($highestRole === 'scouter') {
            $sectionIds = $user->roles->pluck('section_id')->filter();
            $feraaIds = $user->roles->pluck('feraa_id')->filter();
            $query->where(function ($q) use ($sectionIds, $feraaIds) {
                $q->whereIn('section_id', $sectionIds)
                  ->orWhereIn('feraa_id', $feraaIds);
            });
        } elseif ($highestRole === 'leader') {
            $feraaIds = $user->roles->where('role', 'leader')->pluck('feraa_id')->filter();
            $sectionIds = $user->roles->where('role', 'leader')->pluck('section_id')->filter();
            $query->where(function ($q) use ($sectionIds, $feraaIds) {
                $q->whereIn('feraa_id', $feraaIds)
                  ->orWhereIn('section_id', $sectionIds);
            });
        } elseif ($highestRole === 'supervisor') {
            $sectionIds = $user->roles->where('role', 'supervisor')->pluck('section_id')->filter();
            $query->whereIn('section_id', $sectionIds);
        }

        $lectures = $query->paginate(15);
        $sections = Section::with('feraas')->orderBy('display_order')->get();

        return Inertia::render('Lectures/Index', [
            'lectures' => $lectures,
            'sections' => $sections,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
            'week_date' => ['required', 'date'],
            'section_id' => ['required', 'exists:sections,id'],
            'feraa_id' => ['required', 'exists:feraas,id'],
            'file' => ['nullable', 'file', 'max:10240'], // 10MB
        ]);

        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('lectures', 'public');
        }

        Lecture::create([
            'title' => $validated['title'],
            'content' => $validated['content'] ?? null,
            'week_date' => $validated['week_date'],
            'section_id' => $validated['section_id'],
            'feraa_id' => $validated['feraa_id'],
            'file_path' => $filePath,
            'created_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Lecture added successfully.');
    }

    public function show(Lecture $lecture): Response
    {
        $lecture->load(['section', 'feraa', 'author']);

        return Inertia::render('Lectures/Show', [
            'lecture' => $lecture,
        ]);
    }

    public function destroy(Lecture $lecture)
    {
        $lecture->delete();
        return redirect()->route('lectures.index')->with('success', 'Lecture deleted successfully.');
    }
}

