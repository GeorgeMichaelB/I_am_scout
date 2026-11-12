<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Feraa;
use App\Models\Section;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $highestRole = $user->highestRole();

        $query = Announcement::with(['author', 'section', 'feraa'])->latest();

        if ($highestRole === 'scouter' || $highestRole === 'leader') {
            $sectionIds = $user->roles->pluck('section_id')->filter();
            $feraaIds = $user->roles->pluck('feraa_id')->filter();

            $query->where(function ($q) use ($sectionIds, $feraaIds) {
                $q->where('scope', 'general')
                  ->orWhere(function ($sq) use ($sectionIds) {
                      $sq->where('scope', 'section')->whereIn('section_id', $sectionIds);
                  })
                  ->orWhere(function ($fq) use ($feraaIds) {
                      $fq->where('scope', 'feraa')->whereIn('feraa_id', $feraaIds);
                  });
            });
        } elseif ($highestRole === 'supervisor') {
            $sectionIds = $user->roles->where('role', 'supervisor')->pluck('section_id')->filter();
            $query->where(function ($q) use ($sectionIds) {
                $q->where('scope', 'general')
                  ->orWhere(function ($sq) use ($sectionIds) {
                      $sq->where('scope', 'section')->whereIn('section_id', $sectionIds);
                  });
            });
        }

        $announcements = $query->paginate(15);
        $sections = Section::with('feraas')->orderBy('display_order')->get();

        return Inertia::render('Announcements/Index', [
            'announcements' => $announcements,
            'sections' => $sections,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'scope' => ['required', 'in:general,section,feraa'],
            'section_id' => ['nullable', 'exists:sections,id'],
            'feraa_id' => ['nullable', 'exists:feraas,id'],
        ]);

        Announcement::create([
            'title' => $validated['title'],
            'body' => $validated['body'],
            'scope' => $validated['scope'],
            'section_id' => $validated['section_id'] ?? null,
            'feraa_id' => $validated['feraa_id'] ?? null,
            'created_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Announcement published successfully.');
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete();
        return back()->with('success', 'Announcement deleted successfully.');
    }
}

