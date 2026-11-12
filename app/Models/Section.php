<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'display_order'];

    public function feraas()
    {
        return $this->hasMany(Feraa::class);
    }

    public function userRoles()
    {
        return $this->hasMany(UserRole::class);
    }

    public function lectures()
    {
        return $this->hasMany(Lecture::class);
    }

    public function announcements()
    {
        return $this->hasMany(Announcement::class);
    }

    public function events()
    {
        return $this->hasMany(Event::class);
    }
}
