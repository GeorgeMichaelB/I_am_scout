<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'body', 'scope', 'section_id', 'feraa_id', 'created_by'];

    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function feraa()
    {
        return $this->belongsTo(Feraa::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
