<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lecture extends Model
{
    use HasFactory;

    protected $fillable = ['feraa_id', 'section_id', 'title', 'content', 'file_path', 'created_by', 'week_date'];

    protected function casts(): array
    {
        return [
            'week_date' => 'date',
        ];
    }

    public function feraa()
    {
        return $this->belongsTo(Feraa::class);
    }

    public function section()
    {
        return $this->belongsTo(Section::class);
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
