<?php

namespace App\Http\Controllers;

use App\Models\Feraa;
use App\Models\Message;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MessageController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $feraaId = $request->query('feraa_id');

        // Determine available feraas for this user
        $availableFeraas = Feraa::whereHas('userRoles', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->with('section')->get();

        // If admin/dev, can see all feraas
        if (in_array($user->highestRole(), ['dev', 'super_admin', 'admin'])) {
            $availableFeraas = Feraa::with('section')->get();
        }

        $activeFeraa = null;
        if ($feraaId) {
            $activeFeraa = $availableFeraas->firstWhere('id', (int)$feraaId);
        }

        if (!$activeFeraa && $availableFeraas->isNotEmpty()) {
            $activeFeraa = $availableFeraas->first();
        }

        $messages = [];
        if ($activeFeraa) {
            $messages = Message::where('feraa_id', $activeFeraa->id)
                ->with('user')
                ->latest()
                ->take(50)
                ->get()
                ->reverse()
                ->values();
        }

        return Inertia::render('Messages/Index', [
            'availableFeraas' => $availableFeraas,
            'activeFeraa' => $activeFeraa,
            'messages' => $messages,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'feraa_id' => ['required', 'exists:feraas,id'],
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $message = Message::create([
            'feraa_id' => $validated['feraa_id'],
            'user_id' => $request->user()->id,
            'body' => $validated['body'],
        ]);

        return back();
    }
}
