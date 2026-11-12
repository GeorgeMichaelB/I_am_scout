<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WeeklyEvaluation extends Model
{
    use HasFactory;

    protected $fillable = ['feraa_id', 'week_date', 'is_active', 'created_by'];

    protected function casts(): array
    {
        return [
            'week_date' => 'date',
            'is_active' => 'boolean',
        ];
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

    public function entries()
    {
        return $this->hasMany(EvaluationEntry::class, 'evaluation_id');
    }
}
