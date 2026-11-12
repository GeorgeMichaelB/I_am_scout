<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Event;
use App\Models\Feraa;
use App\Models\Lecture;
use App\Models\Section;
use App\Models\Ta7der;
use App\Models\User;
use App\Models\WeeklyEvaluation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user()->loadMissing(['roles.section', 'roles.feraa']);
        $highestRole = $user->highestRole();

        // Common recent items
        $announcements = Announcement::with('author')
            ->latest()
            ->take(5)
            ->get();

        $upcomingEvents = Event::where('start_time', '>=', Carbon::now()->subHours(4))
            ->orderBy('start_time')
            ->take(5)
            ->get();

        $stats = [];
        $sections = [];
        $myFeraa = null;
        $mySection = null;
        $activeEvaluation = null;
        $recentLectures = [];

        // Scouter / Leader context
        $leaderRole = $user->roles->where('role', 'leader')->first();
        $supervisorRole = $user->roles->where('role', 'supervisor')->first();
        $scouterRole = $user->roles->where('role', 'scouter')->first();

        if (in_array($highestRole, ['dev', 'super_admin', 'admin'])) {
            $stats = [
                'total_users' => User::count(),
                'total_sections' => Section::count(),
                'total_events' => Event::count(),
                'active_evaluations' => WeeklyEvaluation::where('is_active', true)->count(),
            ];
            $sections = Section::withCount('feraas')->orderBy('display_order')->get();
        } elseif ($highestRole === 'supervisor' && $supervisorRole) {
            $mySection = Section::with(['feraas.userRoles.user'])->find($supervisorRole->section_id);
            $stats = [
                'section_name' => $mySection?->name,
                'total_feraas' => $mySection ? $mySection->feraas->count() : 0,
                'total_lectures' => Lecture::where('section_id', $supervisorRole->section_id)->count(),
            ];
        } elseif ($highestRole === 'leader' && $leaderRole) {
            $myFeraa = Feraa::with(['section', 'userRoles.user'])->find($leaderRole->feraa_id);
            $activeEvaluation = WeeklyEvaluation::where('feraa_id', $leaderRole->feraa_id)
                ->where('week_date', '>=', Carbon::now()->startOfWeek()->toDateString())
                ->latest()
                ->first();
            $stats = [
                'feraa_name' => $myFeraa?->name,
                'section_name' => $myFeraa?->section?->name,
                'scouters_count' => $myFeraa ? $myFeraa->userRoles->where('role', 'scouter')->count() : 0,
                'evaluation_active' => $activeEvaluation ? $activeEvaluation->is_active : false,
            ];
            $recentLectures = Lecture::where('feraa_id', $leaderRole->feraa_id)->latest()->take(4)->get();
        } else {
            // Normal scouter
            if ($scouterRole) {
                $myFeraa = Feraa::with('section')->find($scouterRole->feraa_id);
                $recentLectures = Lecture::where('feraa_id', $scouterRole->feraa_id)
                    ->orWhere('section_id', $scouterRole->section_id)
                    ->latest()
                    ->take(4)
                    ->get();
            }
            $stats = [
                'feraa_name' => $myFeraa?->name,
                'section_name' => $myFeraa?->section?->name,
            ];
        }

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'sections' => $sections,
            'announcements' => $announcements,
            'upcomingEvents' => $upcomingEvents,
            'myFeraa' => $myFeraa,
            'recentLectures' => $recentLectures,
            'activeEvaluation' => $activeEvaluation,
        ]);
    }
}

