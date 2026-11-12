<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Feraa extends Model
{
    use HasFactory;

    protected $fillable = ['section_id', 'name'];

    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function userRoles()
    {
        return $this->hasMany(UserRole::class);
    }

    public function lectures()
    {
        return $this->hasMany(Lecture::class);
    }

    public function evaluations()
    {
        return $this->hasMany(WeeklyEvaluation::class);
    }

    public function ta7ders()
    {
        return $this->hasMany(Ta7der::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function announcements()
    {
        return $this->hasMany(Announcement::class);
    }
}
