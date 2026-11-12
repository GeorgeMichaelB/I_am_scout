<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserRole extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'role',
        'section_id',
        'feraa_id',
        'can_evaluate_weekly',
        'can_evaluate_camp',
    ];

    protected function casts(): array
    {
        return [
            'can_evaluate_weekly' => 'boolean',
            'can_evaluate_camp' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function feraa()
    {
        return $this->belongsTo(Feraa::class);
    }
}
