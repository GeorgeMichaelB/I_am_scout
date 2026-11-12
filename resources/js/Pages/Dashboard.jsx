import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import Card from '../Components/Card';
import Badge from '../Components/Badge';
import Button from '../Components/Button';
import {
    CalendarDaysIcon,
    BookOpenIcon,
    ClipboardDocumentCheckIcon,
    MegaphoneIcon,
    ArrowUpRightIcon,
    ClockIcon,
    UsersIcon,
    SparklesIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export default function Dashboard({
    stats = {},
    sections = [],
    announcements = [],
    upcomingEvents = [],
    myFeraa = null,
    recentLectures = [],
    activeEvaluation = null,
    scoreStats = null,
}) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const highestRole = user?.highestRole || user?.highest_role || 'scouter';

    const isLeaderOrAbove = ['dev', 'super_admin', 'admin', 'supervisor', 'leader'].includes(highestRole);

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Hero Greeting & Profile Card (Inspired by Reference UI) */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#581C87] via-[#6B21A8] to-[#7E22CE] p-6 sm:p-8 text-white shadow-xl shadow-purple-950/10">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <span className="text-xs uppercase font-extrabold tracking-widest text-purple-200">
                                Scouting Management System
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                                Hello, {user?.full_name}
                            </h2>
                            <p className="text-sm text-purple-100/90 mt-1 max-w-xl">
                                {myFeraa
                                    ? `${myFeraa.name} • ${myFeraa.section?.name || ''}`
                                    : `Active Role: ${highestRole.replace('_', ' ').toUpperCase()}`}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <span className="px-3.5 py-1.5 rounded-2xl bg-white/15 backdrop-blur-md text-xs font-mono font-bold tracking-wider border border-white/20">
                                {user?.scout_id || 'ID: SCOUT-001'}
                            </span>
                            <Badge variant={highestRole} size="lg">
                                {highestRole.replace('_', ' ')}
                            </Badge>
                        </div>
                    </div>

                    {/* Subtle aesthetic curves */}
                    <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {highestRole === 'scouter' ? (
                        <>
                            <Card padding="p-5" className="bg-gradient-to-br from-purple-50/80 to-white">
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Your Fera'a</div>
                                <div className="text-xl font-black text-scout-900 mt-2 truncate">
                                    {myFeraa?.name || "Assigned Fera'a"}
                                </div>
                                <div className="text-xs text-scout-600 mt-1 font-medium">
                                    {myFeraa?.section?.name || 'Section'}
                                </div>
                            </Card>

                            <Card padding="p-5" className="bg-gradient-to-br from-purple-50/70 via-white to-purple-50/30">
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Scout Score</div>
                                <div className="text-2xl font-black text-[#6B21A8] font-mono mt-2">
                                    {scoreStats?.overall_score ?? 100}%
                                </div>
                                <div className="text-xs text-purple-700 font-semibold mt-1">
                                    {scoreStats?.rank_tier || 'First Class Scout'}
                                </div>
                            </Card>

                            <Card padding="p-5" className="bg-gradient-to-br from-emerald-50/70 to-white">
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Attendance Rate</div>
                                <div className="text-2xl font-black text-emerald-800 font-mono mt-2">
                                    {scoreStats?.attendance_rate ?? 100}%
                                </div>
                                <div className="text-xs text-emerald-600 mt-1">
                                    {scoreStats?.total_evaluations ?? 0} assessed sessions
                                </div>
                            </Card>

                            <Card padding="p-5" className="bg-gradient-to-br from-rose-50/70 to-white">
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Next Event</div>
                                <div className="text-xl font-black text-slate-800 mt-2 truncate">
                                    {upcomingEvents[0]?.title || 'Weekly Gathering'}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                    {upcomingEvents[0]?.start_time ? new Date(upcomingEvents[0].start_time).toLocaleDateString() : 'This Friday'}
                                </div>
                            </Card>
                        </>
                    ) : (
                        <>
                            <Card padding="p-5" className="bg-gradient-to-br from-purple-50/70 to-white">
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Scouters</div>
                                <div className="text-2xl font-black text-scout-900 mt-2">
                                    {stats.total_users || stats.scouters_count || 12}
                                </div>
                                <div className="text-xs text-scout-600 mt-1">Active registered</div>
                            </Card>

                            <Card padding="p-5" className="bg-gradient-to-br from-emerald-50/70 to-white">
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Evaluation</div>
                                <div className="text-base font-black text-emerald-800 mt-2">
                                    {activeEvaluation?.is_active ? 'Active This Week' : 'Not Activated'}
                                </div>
                                <div className="text-xs text-emerald-600 mt-1">
                                    {activeEvaluation?.week_date || 'Current week'}
                                </div>
                            </Card>

                            <Card padding="p-5" className="bg-gradient-to-br from-amber-50/70 to-white">
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Sections</div>
                                <div className="text-2xl font-black text-amber-900 mt-2">
                                    {stats.total_sections || 8}
                                </div>
                                <div className="text-xs text-amber-600 mt-1">Organized groups</div>
                            </Card>

                            <Card padding="p-5" className="bg-gradient-to-br from-rose-50/70 to-white">
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Calendar Events</div>
                                <div className="text-2xl font-black text-rose-900 mt-2">
                                    {upcomingEvents.length}
                                </div>
                                <div className="text-xs text-rose-600 mt-1">Upcoming on schedule</div>
                            </Card>
                        </>
                    )}
                </div>

                {/* Main 2-Column Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 Columns: Featured Lectures & Weekly Evaluation */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Weekly Evaluation Action Banner for Leader */}
                        {isLeaderOrAbove && (
                            <Card className="border-purple-200 bg-gradient-to-r from-[#FAF5FF] via-white to-[#F5F0EB]">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <Badge variant="leader" size="sm">Weekly Assessment</Badge>
                                        <h3 className="text-lg font-black text-slate-900 mt-1.5">
                                            Weekly Inspection & Attendance
                                        </h3>
                                        <p className="text-xs text-slate-600 mt-1">
                                            Hair, Trousers, Clothes, Rope & Lectures evaluation.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Link href={route('evaluations.index')}>
                                            <Button variant="primary" size="md">
                                                Open Evaluation Sheet
                                                <ArrowUpRightIcon className="h-4 w-4 ml-1.5" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Recent Lectures Syllabus (Inspired by the Spatial Aptitude card in reference image) */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-extrabold text-slate-900 flex items-center">
                                    <BookOpenIcon className="h-5 w-5 mr-2 text-scout-800" />
                                    Scout Syllabus & Lectures
                                </h3>
                                <Link
                                    href={route('lectures.index')}
                                    className="text-xs font-bold text-scout-700 hover:text-scout-900"
                                >
                                    View all
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {recentLectures.length > 0 ? (
                                    recentLectures.map((lecture) => (
                                        <Card
                                            key={lecture.id}
                                            padding="p-5"
                                            hover
                                            className="bg-white border-purple-100 flex flex-col justify-between"
                                        >
                                            <div>
                                                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                                                    <span className="font-semibold text-scout-700">Lecture</span>
                                                    <span>{lecture.week_date}</span>
                                                </div>
                                                <h4 className="text-base font-bold text-slate-900 leading-snug">
                                                    {lecture.title}
                                                </h4>
                                                <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                                                    {lecture.content || 'Scouting materials and practice guidelines.'}
                                                </p>
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                                <span className="text-[11px] font-semibold text-slate-400">
                                                    Official Material
                                                </span>
                                                <Link
                                                    href={route('lectures.show', lecture.id)}
                                                    className="inline-flex items-center text-xs font-bold text-scout-700 hover:text-scout-900"
                                                >
                                                    Read
                                                    <ArrowUpRightIcon className="h-3 w-3 ml-1" />
                                                </Link>
                                            </div>
                                        </Card>
                                    ))
                                ) : (
                                    <Card padding="p-6" className="sm:col-span-2 text-center text-slate-500 text-xs">
                                        No lectures uploaded for this week yet.
                                    </Card>
                                )}
                            </div>
                        </div>

                        {/* Recent Announcements */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-extrabold text-slate-900 flex items-center">
                                    <MegaphoneIcon className="h-5 w-5 mr-2 text-scout-800" />
                                    Announcements & Directives
                                </h3>
                                <Link
                                    href={route('announcements.index')}
                                    className="text-xs font-bold text-scout-700 hover:text-scout-900"
                                >
                                    View all
                                </Link>
                            </div>

                            <div className="space-y-3">
                                {announcements.map((a) => (
                                    <Card key={a.id} padding="p-5" hover className="border-l-4 border-l-[#6B21A8]">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <Badge variant={a.scope} size="sm">
                                                {a.scope} Announcement
                                            </Badge>
                                            <span className="text-[11px] text-slate-400">
                                                {new Date(a.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-800">{a.title}</h4>
                                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{a.body}</p>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Schedule / Calendar Preview (Inspired by reference UI schedule card) */}
                    <div className="space-y-6">
                        <Card padding="p-6" className="bg-white border-purple-100">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-base font-black text-slate-900">Weekly Schedule</h3>
                                    <p className="text-xs text-slate-400">Upcoming timings & rallies</p>
                                </div>
                                <Link href={route('calendar')}>
                                    <Button variant="soft" size="sm">
                                        Full Calendar
                                    </Button>
                                </Link>
                            </div>

                            <div className="space-y-3">
                                {upcomingEvents.length > 0 ? (
                                    upcomingEvents.map((evt) => (
                                        <div
                                            key={evt.id}
                                            className="p-3.5 rounded-2xl bg-[#FAF7FC] border border-purple-100/60 hover:bg-purple-50/70 transition-colors"
                                        >
                                            <div className="flex items-center justify-between text-[11px] text-scout-700 font-semibold mb-1">
                                                <span className="flex items-center">
                                                    <ClockIcon className="h-3.5 w-3.5 mr-1 text-scout-600" />
                                                    {new Date(evt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span className="text-slate-400">
                                                    {new Date(evt.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <div className="text-sm font-bold text-slate-800">{evt.title}</div>
                                            {evt.description && (
                                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{evt.description}</p>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-slate-400 text-center py-6">No scheduled events.</p>
                                )}
                            </div>
                        </Card>

                        {/* Quick 1-Click Actions Card */}
                        <Card padding="p-6" className="bg-gradient-to-br from-[#FAF5FF] to-white border-purple-100">
                            <h3 className="text-sm font-black uppercase tracking-wider text-scout-900 mb-3">
                                Quick Navigation
                            </h3>
                            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                                <Link
                                    href={route('messages.index')}
                                    className="p-3 rounded-2xl bg-white border border-purple-100 hover:border-purple-300 text-slate-700 hover:text-scout-900 text-center shadow-xs transition-all"
                                >
                                    Group Chat
                                </Link>
                                {isLeaderOrAbove ? (
                                    <Link
                                        href={route('users.index')}
                                        className="p-3 rounded-2xl bg-white border border-purple-100 hover:border-purple-300 text-slate-700 hover:text-scout-900 text-center shadow-xs transition-all"
                                    >
                                        Scouters List
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('announcements.index')}
                                        className="p-3 rounded-2xl bg-white border border-purple-100 hover:border-purple-300 text-slate-700 hover:text-scout-900 text-center shadow-xs transition-all"
                                    >
                                        Notice Board
                                    </Link>
                                )}
                                <Link
                                    href={route('lectures.index')}
                                    className="p-3 rounded-2xl bg-white border border-purple-100 hover:border-purple-300 text-slate-700 hover:text-scout-900 text-center shadow-xs transition-all"
                                >
                                    Syllabus
                                </Link>
                                <Link
                                    href={route('calendar')}
                                    className="p-3 rounded-2xl bg-white border border-purple-100 hover:border-purple-300 text-slate-700 hover:text-scout-900 text-center shadow-xs transition-all"
                                >
                                    Calendar
                                </Link>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
