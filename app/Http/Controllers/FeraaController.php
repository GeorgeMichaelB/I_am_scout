<?php

namespace App\Http\Controllers;

use App\Models\Feraa;
use App\Models\Section;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Http\Request;

class FeraaController extends Controller
{
    public function store(Request $request, Section $section)
    {
        $currentUser = $request->user();
        $isSectionSupervisor = $currentUser->hasRole('supervisor', $section->id);
        if (!in_array($currentUser->highestRole(), ['dev', 'super_admin', 'admin']) && !$isSectionSupervisor) {
            abort(403, 'Unauthorized to add Fera\'a to this section.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $feraa = $section->feraas()->create($validated);

        return back()->with('success', "Fera'a '{$feraa->name}' created successfully.");
    }

    public function update(Request $request, Feraa $feraa)
    {
        $currentUser = $request->user();
        $isSectionSupervisor = $currentUser->hasRole('supervisor', $feraa->section_id);
        if (!in_array($currentUser->highestRole(), ['dev', 'super_admin', 'admin']) && !$isSectionSupervisor) {
            abort(403, 'Unauthorized to update this Fera\'a.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $feraa->update($validated);

        return back()->with('success', "Fera'a updated successfully.");
    }

    public function destroy(Request $request, Feraa $feraa)
    {
        $currentUser = $request->user();
        $isSectionSupervisor = $currentUser->hasRole('supervisor', $feraa->section_id);
        if (!in_array($currentUser->highestRole(), ['dev', 'super_admin', 'admin']) && !$isSectionSupervisor) {
            abort(403, 'Unauthorized to delete this Fera\'a.');
        }

        $feraa->delete();

        return back()->with('success', "Fera'a deleted successfully.");
    }

    public function assignLeader(Request $request, Feraa $feraa)
    {
        $currentUser = $request->user();
        $isSectionSupervisor = $currentUser->hasRole('supervisor', $feraa->section_id);

        if (!in_array($currentUser->highestRole(), ['dev', 'super_admin', 'admin']) && !$isSectionSupervisor) {
            abort(403, 'Only Admins and this Section\'s Supervisor can assign leaders to this Fera\'a.');
        }

        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
        ]);

        UserRole::firstOrCreate([
            'user_id' => $validated['user_id'],
            'role' => 'leader',
            'section_id' => $feraa->section_id,
            'feraa_id' => $feraa->id,
        ]);

        $leader = User::find($validated['user_id']);

        return back()->with('success', "{$leader->full_name} assigned as Leader to {$feraa->name}.");
    }

    public function removeLeader(Request $request, Feraa $feraa, User $user)
    {
        $currentUser = $request->user();
        $isSectionSupervisor = $currentUser->hasRole('supervisor', $feraa->section_id);

        if (!in_array($currentUser->highestRole(), ['dev', 'super_admin', 'admin']) && !$isSectionSupervisor) {
            abort(403, 'Only Admins and this Section\'s Supervisor can remove leaders.');
        }

        UserRole::where('user_id', $user->id)
            ->where('role', 'leader')
            ->where('feraa_id', $feraa->id)
            ->delete();

        return back()->with('success', "{$user->full_name} removed as Leader from {$feraa->name}.");
    }
}
