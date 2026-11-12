<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        if ($user) {
            $user->loadMissing(['roles.section', 'roles.feraa']);
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'scout_id' => $user->scout_id,
                    'full_name' => $user->full_name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'gender' => $user->gender,
                    'avatar' => $user->avatar,
                    'highestRole' => $user->highestRole(),
                    'highest_role' => $user->highestRole(),
                    'isAdmin' => in_array($user->highestRole(), ['dev', 'super_admin', 'admin']),
                    'isSuperAdmin' => in_array($user->highestRole(), ['dev', 'super_admin']),
                    'isSupervisor' => in_array($user->highestRole(), ['dev', 'super_admin', 'admin', 'supervisor']),
                    'isLeader' => in_array($user->highestRole(), ['dev', 'super_admin', 'admin', 'supervisor', 'leader']),
                    'roles' => $user->roles->map(function ($r) {
                        return [
                            'id' => $r->id,
                            'role' => $r->role,
                            'section_id' => $r->section_id,
                            'section_name' => $r->section?->name,
                            'feraa_id' => $r->feraa_id,
                            'feraa_name' => $r->feraa?->name,
                        ];
                    }),
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'info' => fn () => $request->session()->get('info'),
            ],
        ];
    }
}
