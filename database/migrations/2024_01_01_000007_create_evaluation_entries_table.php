<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluation_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluation_id')->constrained('weekly_evaluations')->cascadeOnDelete();
            $table->foreignId('scouter_id')->constrained('users');
            $table->boolean('hair')->default(false);
            $table->boolean('trousers')->default(false);
            $table->boolean('clothes')->default(false);
            $table->boolean('rope')->default(false);
            $table->integer('missed_lectures')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluation_entries');
    }
};
