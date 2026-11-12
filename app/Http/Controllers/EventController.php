<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Section;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $highestRole = $user->highestRole();

        $query = Event::with(['author', 'section'])->orderBy('start_time');

        if ($highestRole === 'scouter' || $highestRole === 'leader') {
            $sectionIds = $user->roles->pluck('section_id')->filter();
            $query->where(function ($q) use ($sectionIds) {
                $q->whereNull('section_id')
                  ->orWhereIn('section_id', $sectionIds);
            });
        } elseif ($highestRole === 'supervisor') {
            $sectionIds = $user->roles->where('role', 'supervisor')->pluck('section_id')->filter();
            $query->where(function ($q) use ($sectionIds) {
                $q->whereNull('section_id')
                  ->orWhereIn('section_id', $sectionIds);
            });
        }

        $events = $query->paginate(20);
        $sections = Section::orderBy('display_order')->get();

        return Inertia::render('Events/Index', [
            'events' => $events,
            'sections' => $sections,
        ]);
    }

    public function calendar(Request $request): Response
    {
        $user = $request->user();
        $highestRole = $user->highestRole();

        $query = Event::with('section')->orderBy('start_time');

        if (in_array($highestRole, ['scouter', 'leader', 'supervisor'])) {
            $sectionIds = $user->roles->pluck('section_id')->filter();
            $query->where(function ($q) use ($sectionIds) {
                $q->whereNull('section_id')
                  ->orWhereIn('section_id', $sectionIds);
            });
        }

        $events = $query->get();
        $sections = Section::orderBy('display_order')->get();

        return Inertia::render('Calendar', [
            'events' => $events,
            'sections' => $sections,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'start_time' => ['required', 'date'],
            'end_time' => ['required', 'date', 'after_or_equal:start_time'],
            'section_id' => ['nullable', 'exists:sections,id'],
        ]);

        Event::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'section_id' => $validated['section_id'] ?? null,
            'created_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Event scheduled successfully.');
    }

    public function destroy(Event $event)
    {
        $event->delete();
        return back()->with('success', 'Event removed.');
    }
}
