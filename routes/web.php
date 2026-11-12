<?php

use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\FeraaController;
use App\Http\Controllers\LectureController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\Ta7derController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Guest Routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'login'])->name('login');
    Route::post('/login', [AuthController::class, 'authenticate']);
});

// Authenticated Routes
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Sections & Feraas
    Route::get('/sections', [SectionController::class, 'index'])->name('sections.index');
    Route::get('/sections/{section}', [SectionController::class, 'show'])->name('sections.show');
    Route::post('/sections/{section}/assign-supervisor', [SectionController::class, 'assignSupervisor'])->name('sections.assign-supervisor');
    Route::delete('/sections/{section}/supervisor/{user}', [SectionController::class, 'removeSupervisor'])->name('sections.remove-supervisor');
    Route::post('/sections/{section}/feraas', [FeraaController::class, 'store'])->name('feraas.store');
    Route::put('/feraas/{feraa}', [FeraaController::class, 'update'])->name('feraas.update');
    Route::delete('/feraas/{feraa}', [FeraaController::class, 'destroy'])->name('feraas.destroy');
    Route::post('/feraas/{feraa}/assign-leader', [FeraaController::class, 'assignLeader'])->name('feraas.assign-leader');
    Route::delete('/feraas/{feraa}/leaders/{user}', [FeraaController::class, 'removeLeader'])->name('feraas.remove-leader');

    // Scouters & Users
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::get('/users/import-template', [UserController::class, 'importTemplate'])->name('users.import-template');
    Route::post('/users/import', [UserController::class, 'import'])->name('users.import');
    Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

    // Roles (Super Admin)
    Route::get('/roles', [RoleController::class, 'index'])->name('roles.index');
    Route::post('/roles', [RoleController::class, 'store'])->name('roles.store');
    Route::post('/roles/upgrade-downgrade/{user}', [RoleController::class, 'upgradeDowngrade'])->name('roles.upgrade-downgrade');
    Route::delete('/roles/{userRole}', [RoleController::class, 'destroy'])->name('roles.destroy');

    // Lectures
    Route::get('/lectures', [LectureController::class, 'index'])->name('lectures.index');
    Route::post('/lectures', [LectureController::class, 'store'])->name('lectures.store');
    Route::get('/lectures/{lecture}', [LectureController::class, 'show'])->name('lectures.show');
    Route::delete('/lectures/{lecture}', [LectureController::class, 'destroy'])->name('lectures.destroy');

    // Evaluations
    Route::get('/evaluations', [EvaluationController::class, 'index'])->name('evaluations.index');
    Route::post('/evaluations', [EvaluationController::class, 'store'])->name('evaluations.store');
    Route::get('/evaluations/{evaluation}', [EvaluationController::class, 'show'])->name('evaluations.show');
    Route::put('/evaluations/{evaluation}/toggle', [EvaluationController::class, 'toggleActive'])->name('evaluations.toggle');
    Route::post('/evaluations/{evaluation}/entries', [EvaluationController::class, 'storeEntry'])->name('evaluations.entries');
    Route::post('/evaluations/toggle-leader-access/{userRole?}', [EvaluationController::class, 'toggleLeaderAccess'])->name('evaluations.toggle-leader-access');

    // Ta7der
    Route::get('/ta7der', [Ta7derController::class, 'index'])->name('ta7der.index');
    Route::post('/ta7der', [Ta7derController::class, 'store'])->name('ta7der.store');

    // Announcements
    Route::get('/announcements', [AnnouncementController::class, 'index'])->name('announcements.index');
    Route::post('/announcements', [AnnouncementController::class, 'store'])->name('announcements.store');
    Route::delete('/announcements/{announcement}', [AnnouncementController::class, 'destroy'])->name('announcements.destroy');

    // Events & Calendar
    Route::get('/events', [EventController::class, 'index'])->name('events.index');
    Route::post('/events', [EventController::class, 'store'])->name('events.store');
    Route::delete('/events/{event}', [EventController::class, 'destroy'])->name('events.destroy');
    Route::get('/calendar', [EventController::class, 'calendar'])->name('calendar');

    // Group Messages
    Route::get('/messages', [MessageController::class, 'index'])->name('messages.index');
    Route::post('/messages', [MessageController::class, 'store'])->name('messages.store');
});
