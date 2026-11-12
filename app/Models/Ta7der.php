<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ta7der extends Model
{
    use HasFactory;

    protected $fillable = ['leader_id', 'feraa_id', 'week_date', 'content', 'submitted_at'];

    protected function casts(): array
    {
        return [
            'week_date' => 'date',
            'submitted_at' => 'datetime',
        ];
    }

    public function leader()
    {
        return $this->belongsTo(User::class, 'leader_id');
    }

    public function feraa()
    {
        return $this->belongsTo(Feraa::class);
    }
}
