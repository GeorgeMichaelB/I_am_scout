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

    public function hasRole(string $role, ?int $sectionId = null, ?int $feraaId = null): bool
    {
        $query = $this->roles()->where('role', $role);

        if ($sectionId !== null) {
            $query->where('section_id', $sectionId);
        }

        if ($feraaId !== null) {
            $query->where('feraa_id', $feraaId);
        }

        return $query->exists();
    }

    public function highestRole(): ?string
    {
        $priority = ['dev', 'super_admin', 'admin', 'supervisor', 'leader', 'scouter'];

        $userRoles = $this->roles()->pluck('role')->toArray();

        foreach ($priority as $role) {
            if (in_array($role, $userRoles)) {
                return $role;
            }
        }

        return null;
    }
}
