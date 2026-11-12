<?php

namespace App\Models;

use Filament\Models\Contracts\FilamentUser;
use Filament\Models\Contracts\HasName;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements FilamentUser, HasName
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'scout_id',
        'full_name',
        'email',
        'password',
        'phone',
        'mom_phone',
        'dad_phone',
        'school',
        'grade',
        'gender',
        'sunday_school_family',
        'address',
        'diseases',
        'notes',
        'avatar',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    public function getFilamentName(): string
    {
        return $this->full_name ?? $this->email;
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return in_array($this->highestRole(), ['dev', 'super_admin', 'admin', 'supervisor']);
    }

    public function roles()
    {
        return $this->hasMany(UserRole::class);
    }

    public function highestRole(): string
    {
        $priority = ['dev', 'super_admin', 'admin', 'supervisor', 'leader', 'scouter'];

        $userRoles = $this->roles()->pluck('role')->toArray();

        foreach ($priority as $role) {
            if (in_array($role, $userRoles)) {
                return $role;
            }
        }

        return 'scouter';
    }

    public function hasRole(string $role, ?int $sectionId = null, ?int $feraaId = null): bool
    {
        $highest = $this->highestRole();

        // Dev and Super Admin possess universal authority
        if (in_array($highest, ['dev', 'super_admin'])) {
            return true;
        }

        // Admin has full scouting group authority across sections and feraas
        if ($highest === 'admin') {
            return in_array($role, ['admin', 'supervisor', 'leader', 'scouter']);
        }

        // Supervisor has supervisor, leader, and scouter authority within their section
        if ($highest === 'supervisor') {
            if ($sectionId === null) {
                return in_array($role, ['supervisor', 'leader', 'scouter']);
            }

            $isSupervisorOfSection = $this->roles()
                ->where('role', 'supervisor')
                ->where('section_id', $sectionId)
                ->exists();

            if ($isSupervisorOfSection) {
                return in_array($role, ['supervisor', 'leader', 'scouter']);
            }
        }

        // Leader has leader and scouter authority within their feraa
        if ($highest === 'leader') {
            if ($sectionId === null && $feraaId === null) {
                return in_array($role, ['leader', 'scouter']);
            }

            $query = $this->roles()->where('role', 'leader');
            if ($sectionId !== null) {
                $query->where('section_id', $sectionId);
            }
            if ($feraaId !== null) {
                $query->where('feraa_id', $feraaId);
            }

            if ($query->exists()) {
                return in_array($role, ['leader', 'scouter']);
            }
        }

        // Direct record match in user_roles
        $query = $this->roles()->where('role', $role);

        if ($sectionId !== null) {
            $query->where('section_id', $sectionId);
        }

        if ($feraaId !== null) {
            $query->where('feraa_id', $feraaId);
        }

        return $query->exists();
    }

    public function evaluationEntries()
    {
        return $this->hasMany(EvaluationEntry::class, 'scouter_id');
    }

    public function getScoutScoreStats(): array
    {
        $entries = EvaluationEntry::where('scouter_id', $this->id)
            ->whereHas('evaluation', fn ($q) => $q->where('is_active', true))
            ->with(['evaluation.feraa.section'])
            ->get();

        $totalEvaluations = $entries->count();

        if ($totalEvaluations === 0) {
            return [
                'total_evaluations' => 0,
                'overall_score' => 100,
                'weekly_count' => 0,
                'weekly_average' => 100,
                'camp_count' => 0,
                'camp_average' => 100,
                'attendance_rate' => 100,
                'total_infractions' => 0,
                'total_missed_lectures' => 0,
                'rank_tier' => 'Standard Scout',
                'history' => [],
            ];
        }

        $weeklyEntries = $entries->filter(fn ($e) => $e->evaluation?->type === 'weekly');
        $campEntries = $entries->filter(fn ($e) => $e->evaluation?->type === 'camp');

        $weeklyAvg = $weeklyEntries->count() > 0 ? round($weeklyEntries->avg('score')) : 100;
        $campAvg = $campEntries->count() > 0 ? round($campEntries->avg('score')) : 100;
        $overallScore = round($entries->avg('score'));

        $totalInfractions = $entries->reduce(function ($acc, $e) {
            return $acc + ($e->hair ? 1 : 0) + ($e->trousers ? 1 : 0) + ($e->clothes ? 1 : 0) + ($e->rope ? 1 : 0) + ($e->tent_bad ? 1 : 0);
        }, 0);

        $totalMissed = $entries->sum('missed_lectures');
        $fullAttendanceCount = $entries->where('missed_lectures', 0)->count();
        $attendanceRate = round(($fullAttendanceCount / $totalEvaluations) * 100);

        $rankTier = 'Third Class Scout';
        if ($overallScore >= 90) {
            $rankTier = 'First Class Scout';
        } elseif ($overallScore >= 75) {
            $rankTier = 'Second Class Scout';
        } elseif ($overallScore < 60) {
            $rankTier = 'Needs Improvement';
        }

        $history = $entries->map(function ($e) {
            return [
                'id' => $e->id,
                'evaluation_id' => $e->evaluation_id,
                'type' => $e->evaluation?->type ?? 'weekly',
                'name' => $e->evaluation?->type === 'camp' ? ($e->evaluation->camp_name ?: 'Scout Camp') : 'Weekly Assessment',
                'date' => $e->evaluation?->week_date ? (is_string($e->evaluation->week_date) ? $e->evaluation->week_date : $e->evaluation->week_date->format('Y-m-d')) : 'N/A',
                'section_name' => $e->evaluation?->feraa?->section?->name,
                'feraa_name' => $e->evaluation?->feraa?->name,
                'score' => $e->score ?? 100,
                'hair' => (bool)$e->hair,
                'trousers' => (bool)$e->trousers,
                'clothes' => (bool)$e->clothes,
                'rope' => (bool)$e->rope,
                'tent_bad' => (bool)$e->tent_bad,
                'missed_lectures' => (int)$e->missed_lectures,
                'notes' => $e->notes,
            ];
        });

        return [
            'total_evaluations' => $totalEvaluations,
            'overall_score' => $overallScore,
            'weekly_count' => $weeklyEntries->count(),
            'weekly_average' => $weeklyAvg,
            'camp_count' => $campEntries->count(),
            'camp_average' => $campAvg,
            'attendance_rate' => $attendanceRate,
            'total_infractions' => $totalInfractions,
            'total_missed_lectures' => $totalMissed,
            'rank_tier' => $rankTier,
            'history' => $history,
        ];
    }
}
