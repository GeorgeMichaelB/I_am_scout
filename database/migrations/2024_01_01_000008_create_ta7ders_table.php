<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ta7ders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('leader_id')->constrained('users');
            $table->foreignId('feraa_id')->constrained();
            $table->date('week_date');
            $table->text('content');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ta7ders');
    }
};
