<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = ['feraa_id', 'user_id', 'body'];

    public function feraa()
    {
        return $this->belongsTo(Feraa::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
