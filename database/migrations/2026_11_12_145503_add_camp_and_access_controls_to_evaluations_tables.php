<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('weekly_evaluations', function (Blueprint $table) {
            $table->string('type')->default('weekly')->after('feraa_id');
            $table->string('camp_name')->nullable()->after('type');
            $table->boolean('is_locked')->default(false)->after('is_active');
        });

        Schema::table('evaluation_entries', function (Blueprint $table) {
            $table->integer('score')->default(100)->after('missed_lectures');
            $table->boolean('tent_bad')->default(false)->after('rope');
            $table->text('notes')->nullable()->after('score');
        });

        Schema::table('user_roles', function (Blueprint $table) {
            $table->boolean('can_evaluate_weekly')->default(true)->after('feraa_id');
            $table->boolean('can_evaluate_camp')->default(true)->after('can_evaluate_weekly');
        });
    }

    public function down(): void
    {
        Schema::table('weekly_evaluations', function (Blueprint $table) {
            $table->dropColumn(['type', 'camp_name', 'is_locked']);
        });

        Schema::table('evaluation_entries', function (Blueprint $table) {
            $table->dropColumn(['score', 'tent_bad', 'notes']);
        });

        Schema::table('user_roles', function (Blueprint $table) {
            $table->dropColumn(['can_evaluate_weekly', 'can_evaluate_camp']);
        });
    }
};
