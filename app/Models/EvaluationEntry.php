<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'evaluation_id',
        'scouter_id',
        'hair',
        'trousers',
        'clothes',
        'rope',
        'tent_bad',
        'missed_lectures',
        'score',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'hair' => 'boolean',
            'trousers' => 'boolean',
            'clothes' => 'boolean',
            'rope' => 'boolean',
            'tent_bad' => 'boolean',
            'missed_lectures' => 'integer',
            'score' => 'integer',
        ];
    }

    public function evaluation()
    {
        return $this->belongsTo(WeeklyEvaluation::class, 'evaluation_id');
    }

    public function scouter()
    {
        return $this->belongsTo(User::class, 'scouter_id');
    }
}
