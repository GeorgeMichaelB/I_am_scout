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
        $sections = Section::with(['feraas' => function ($q) {
            $q->withCount(['userRoles as scouters_count' => function ($sq) {
                $sq->where('role', 'scouter');
            }, 'userRoles as leaders_count' => function ($lq) {
                $lq->where('role', 'leader');
            }]);
        }])
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

        // Get available Gawala / Morashahen users for assigning as leaders
        $availableLeaders = User::whereHas('roles', function ($q) {
            $q->whereIn('role', ['leader', 'scouter']);
        })
        ->select('id', 'full_name', 'scout_id', 'email')
        ->get();

        return Inertia::render('Sections/Show', [
            'section' => $section,
            'availableLeaders' => $availableLeaders,
        ]);
    }
}

