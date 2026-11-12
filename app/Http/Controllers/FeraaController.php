<?php

namespace App\Http\Controllers;

use App\Models\Feraa;
use App\Models\Section;
use App\Models\UserRole;
use Illuminate\Http\Request;

class FeraaController extends Controller
{
    public function store(Request $request, Section $section)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $feraa = $section->feraas()->create($validated);

        return back()->with('success', "Fera'a created successfully.");
    }

    public function update(Request $request, Feraa $feraa)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $feraa->update($validated);

        return back()->with('success', "Fera'a updated successfully.");
    }

    public function destroy(Feraa $feraa)
    {
        $feraa->delete();

        return back()->with('success', "Fera'a deleted successfully.");
    }

    public function assignLeader(Request $request, Feraa $feraa)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
        ]);

        UserRole::firstOrCreate([
            'user_id' => $validated['user_id'],
            'role' => 'leader',
            'section_id' => $feraa->section_id,
            'feraa_id' => $feraa->id,
        ]);

        return back()->with('success', 'Leader assigned to this Fera\'a successfully.');
    }

    public function removeLeader(Request $request, Feraa $feraa, int $userId)
    {
        UserRole::where('user_id', $userId)
            ->where('role', 'leader')
            ->where('feraa_id', $feraa->id)
            ->delete();

        return back()->with('success', 'Leader removed from this Fera\'a.');
    }
}
