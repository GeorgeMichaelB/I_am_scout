import React, { useState, useMemo } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import Card from '../../Components/Card';
import Button from '../../Components/Button';
import Badge from '../../Components/Badge';
import {
    ArrowLeftIcon,
    CheckIcon,
    CheckCircleIcon,
    XCircleIcon,
    ShieldExclamationIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    PlusIcon,
    MinusIcon,
    ArrowPathIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';

export default function EvaluationsShow({ evaluation, scouterEntries = [], isRestricted = false }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const highestRole = user?.highestRole || user?.highest_role || 'scouter';

    const canEdit = ['dev', 'super_admin', 'admin', 'supervisor', 'leader'].includes(highestRole) && !isRestricted;
    const isCamp = evaluation.type === 'camp';

    // Calculate score based on infractions checked (Base: 100)
    const calculateScore = (entry, type) => {
        if (type === 'camp') {
            return Math.max(
                0,
                100 -
                    (entry.hair ? 15 : 0) -
                    (entry.clothes ? 20 : 0) -
                    (entry.tent_bad ? 20 : 0) -
                    (entry.rope ? 15 : 0) -
                    ((entry.missed_lectures || 0) * 15)
            );
        }
        return Math.max(
            0,
            100 -
                (entry.hair ? 15 : 0) -
                (entry.trousers ? 15 : 0) -
                (entry.clothes ? 20 : 0) -
                (entry.rope ? 10 : 0) -
                ((entry.missed_lectures || 0) * 10)
        );
    };

    // State
    const [entries, setEntries] = useState(
        scouterEntries.map((e) => ({
            ...e,
            score: calculateScore(e, evaluation.type),
        }))
    );
    const [saving, setSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'clean' | 'infractions'

    // Update by scouter ID to safely support filtering & searching
    const updateEntry = (scouterId, updater) => {
        if (!canEdit) return;
        setIsDirty(true);
        setEntries((prev) =>
            prev.map((item) => {
                if (item.scouter_id === scouterId) {
                    const updated = updater({ ...item });
                    updated.score = calculateScore(updated, evaluation.type);
                    return updated;
                }
                return item;
            })
        );
    };

    const toggleInfraction = (scouterId, field) => {
        updateEntry(scouterId, (item) => {
            item[field] = !item[field];
            return item;
        });
    };

    const stepMissedLectures = (scouterId, delta) => {
        updateEntry(scouterId, (item) => {
            const current = item.missed_lectures || 0;
            item.missed_lectures = Math.max(0, current + delta);
            return item;
        });
    };

    const setMissedLectures = (scouterId, val) => {
        updateEntry(scouterId, (item) => {
            item.missed_lectures = Math.max(0, parseInt(val) || 0);
            return item;
        });
    };

    const handleMarkAllClean = () => {
        if (!canEdit) return;
        setIsDirty(true);
        setEntries((prev) =>
            prev.map((item) => ({
                ...item,
                hair: false,
                trousers: false,
                clothes: false,
                tent_bad: false,
                rope: false,
                missed_lectures: 0,
                score: 100,
            }))
        );
    };

    const handleSaveEntries = (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        router.post(
            route('evaluations.entries', evaluation.id),
            { entries },
            {
                preserveScroll: true,
                onSuccess: () => setIsDirty(false),
                onFinish: () => setSaving(false),
            }
        );
    };

    const handleToggleActive = () => {
        router.put(route('evaluations.toggle', evaluation.id), {}, { preserveScroll: true });
    };

    // Filtered entries
    const filteredEntries = useMemo(() => {
        return entries.filter((item) => {
            const matchesSearch =
                !searchQuery.trim() ||
                (item.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.scout_id || '').toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            if (statusFilter === 'clean') return item.score === 100;
            if (statusFilter === 'infractions') return item.score < 100;
            return true;
        });
    }, [entries, searchQuery, statusFilter]);

    // Summary calculations
    const totalScouters = entries.length;
    const cleanCount = entries.filter((e) => e.score === 100).length;
    const infractionCount = totalScouters - cleanCount;
    const averageScore =
        totalScouters > 0
            ? Math.round(entries.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalScouters)
            : 100;

    const getScoreStyle = (score) => {
        if (score === 100) {
            return {
                bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                badge: 'bg-emerald-100 text-emerald-800',
                text: 'Clean 100%',
            };
        }
        if (score >= 75) {
            return {
                bg: 'bg-purple-50 text-purple-900 border-purple-200',
                badge: 'bg-purple-100 text-purple-800',
                text: 'Good',
            };
        }
        if (score >= 50) {
            return {
                bg: 'bg-amber-50 text-amber-900 border-amber-200',
                badge: 'bg-amber-100 text-amber-800',
                text: 'Needs Work',
            };
        }
        return {
            bg: 'bg-rose-50 text-rose-900 border-rose-200',
            badge: 'bg-rose-100 text-rose-800',
            text: 'Critical',
        };
    };

    return (
        <AuthenticatedLayout header={isCamp ? 'Camp Assessment Sheet' : 'Weekly Assessment Sheet'}>
            <Head title={`Evaluation - ${evaluation.week_date}`} />

            <div className="space-y-5 pb-24">
                {/* Supervisor Lock Alert */}
                {isRestricted && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-3 shadow-xs">
                        <ShieldExclamationIcon className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-extrabold text-sm block">
                                Evaluation Access Locked by Section Supervisor
                            </span>
                            <span className="text-xs">
                                Editing permissions for this Fera'a have been restricted by your Section Supervisor. Existing scores can be viewed, but modifications are disabled.
                            </span>
                        </div>
                    </div>
                )}

                {/* Top Navigation & Status Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <Link
                        href={route('evaluations.index')}
                        className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-[#6B21A8] transition-colors"
                    >
                        <ArrowLeftIcon className="h-4 w-4 mr-1.5" />
                        Back to Evaluations Center
                    </Link>

                    <div className="flex items-center gap-2">
                        {canEdit && (
                            <button
                                type="button"
                                onClick={handleToggleActive}
                                className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                    evaluation.is_active
                                        ? 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                        : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                }`}
                            >
                                {evaluation.is_active ? (
                                    <>
                                        <XCircleIcon className="h-3.5 w-3.5 mr-1 text-slate-400" />
                                        Counted Active
                                    </>
                                ) : (
                                    <>
                                        <CheckCircleIcon className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                                        Activate Sheet
                                    </>
                                )}
                            </button>
                        )}

                        {canEdit && (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleSaveEntries}
                                disabled={saving}
                            >
                                <CheckIcon className="h-4 w-4 mr-1.5" />
                                {saving ? 'Saving...' : isDirty ? 'Save Changes' : 'Saved'}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Hero Header Card */}
                <Card padding="p-5 sm:p-6" className="bg-white border-purple-100/80 shadow-xs">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                        <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                                <span
                                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                        isCamp
                                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                            : 'bg-purple-100 text-purple-900 border border-purple-200'
                                    }`}
                                >
                                    {isCamp ? 'Camp Inspection' : 'Weekly Gathering'}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                                    {evaluation.feraa?.name || "Fera'a"}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-slate-500">
                                    {evaluation.feraa?.section?.name || 'Section'}
                                </span>
                            </div>

                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                {isCamp ? (evaluation.camp_name || 'Camp Evaluation Sheet') : `Inspection of ${evaluation.week_date}`}
                            </h1>

                            <p className="text-xs text-slate-500 font-medium">
                                Date: <span className="font-semibold text-slate-700">{evaluation.week_date}</span>
                                {' • '}Evaluated by: <span className="font-semibold text-slate-700">{evaluation.author?.full_name || 'Leader'}</span>
                            </p>
                        </div>

                        {/* 3 Metric Pills */}
                        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 bg-[#FAF7FC] p-3 rounded-2xl border border-purple-100/70 text-center shrink-0">
                            <div className="px-3 py-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total</span>
                                <span className="text-lg font-black text-slate-900 font-mono block leading-tight">{totalScouters}</span>
                                <span className="text-[10px] text-slate-500 font-medium">Scouters</span>
                            </div>
                            <div className="px-3 py-1 border-x border-purple-100">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Clean</span>
                                <span className="text-lg font-black text-emerald-700 font-mono block leading-tight">{cleanCount}</span>
                                <span className="text-[10px] text-emerald-600 font-medium">100% Score</span>
                            </div>
                            <div className="px-3 py-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Average</span>
                                <span className="text-lg font-black text-[#6B21A8] font-mono block leading-tight">{averageScore}%</span>
                                <span className="text-[10px] text-purple-700 font-medium">Fera'a Avg</span>
                            </div>
                        </div>
                    </div>

                    {/* Helper Legend Strip */}
                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500">
                        <div className="flex items-center space-x-1.5 font-medium">
                            <span className="font-bold text-slate-700">Deduction Rules (Base: 100 pts):</span>
                            <span>Tap an item to flag an infraction and penalize score.</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-slate-600">
                            {isCamp ? (
                                <>
                                    <span className="bg-slate-100 px-2 py-0.5 rounded-md">Hair -15</span>
                                    <span className="bg-slate-100 px-2 py-0.5 rounded-md">Uniform -20</span>
                                    <span className="bg-slate-100 px-2 py-0.5 rounded-md">Tent -20</span>
                                    <span className="bg-slate-100 px-2 py-0.5 rounded-md">Rope -15</span>
                                    <span className="bg-slate-100 px-2 py-0.5 rounded-md">Activity -15 ea</span>
                                </>
                            ) : (
                                <>
                                    <span className="bg-slate-100 px-2 py-0.5 rounded-md">Hair -15</span>
                                    <span className="bg-slate-100 px-2 py-0.5 rounded-md">Trousers -15</span>
                                    <span className="bg-slate-100 px-2 py-0.5 rounded-md">Uniform -20</span>
                                    <span className="bg-slate-100 px-2 py-0.5 rounded-md">Rope -10</span>
                                    <span className="bg-slate-100 px-2 py-0.5 rounded-md">Lecture -10 ea</span>
                                </>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Search & Filter Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                        <MagnifyingGlassIcon className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Find scouter by name or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-white border border-purple-100 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-purple-300"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Filter Pills & Quick Clean */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                            type="button"
                            onClick={() => setStatusFilter('all')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                statusFilter === 'all'
                                    ? 'bg-[#6B21A8] text-white shadow-xs'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            All ({totalScouters})
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('clean')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                statusFilter === 'clean'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            Clean ({cleanCount})
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('infractions')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                statusFilter === 'infractions'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            Faults ({infractionCount})
                        </button>

                        {canEdit && (
                            <button
                                type="button"
                                onClick={handleMarkAllClean}
                                title="Set all scouters to clean 100 points"
                                className="ml-1 inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-purple-200 text-[#6B21A8] hover:bg-purple-50 transition-colors"
                            >
                                <ArrowPathIcon className="h-3.5 w-3.5 mr-1" />
                                Mark All Clean
                            </button>
                        )}
                    </div>
                </div>

                {/* Desktop View: Clean Inspection Table */}
                <div className="hidden lg:block">
                    <Card padding="p-0" className="overflow-hidden border-purple-100 bg-white">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-[#FAF7FC] text-slate-600 uppercase tracking-wider font-extrabold text-[10px] border-b border-purple-100">
                                    <tr>
                                        <th className="py-3.5 px-4">Scout</th>
                                        <th className="py-3.5 px-3 text-center">
                                            Bad Hair
                                            <span className="block text-[9px] text-rose-500 font-mono font-bold">-15 pts</span>
                                        </th>
                                        {!isCamp ? (
                                            <th className="py-3.5 px-3 text-center">
                                                Bad Trousers
                                                <span className="block text-[9px] text-rose-500 font-mono font-bold">-15 pts</span>
                                            </th>
                                        ) : (
                                            <th className="py-3.5 px-3 text-center">
                                                Untidy Tent
                                                <span className="block text-[9px] text-rose-500 font-mono font-bold">-20 pts</span>
                                            </th>
                                        )}
                                        <th className="py-3.5 px-3 text-center">
                                            Bad Uniform
                                            <span className="block text-[9px] text-rose-500 font-mono font-bold">-20 pts</span>
                                        </th>
                                        <th className="py-3.5 px-3 text-center">
                                            Missing Rope
                                            <span className="block text-[9px] text-rose-500 font-mono font-bold">
                                                {isCamp ? '-15 pts' : '-10 pts'}
                                            </span>
                                        </th>
                                        <th className="py-3.5 px-3 text-center">
                                            {isCamp ? 'Missed Activity' : 'Missed Lecture'}
                                            <span className="block text-[9px] text-rose-500 font-mono font-bold">
                                                {isCamp ? '-15 ea' : '-10 ea'}
                                            </span>
                                        </th>
                                        <th className="py-3.5 px-4 text-center">Live Score</th>
                                        <th className="py-3.5 px-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-purple-50/70">
                                    {filteredEntries && filteredEntries.length > 0 ? (
                                        filteredEntries.map((entry) => {
                                            const score = entry.score ?? 100;
                                            const scoreStyle = getScoreStyle(score);

                                            return (
                                                <tr key={entry.scouter_id} className="hover:bg-purple-50/20 transition-colors">
                                                    {/* Scout Identity */}
                                                    <td className="py-3 px-4">
                                                        <div className="font-extrabold text-slate-900 text-sm">
                                                            {entry.full_name}
                                                        </div>
                                                        <div className="font-mono text-[10px] text-purple-700 font-bold">
                                                            {entry.scout_id || 'ID Pending'}
                                                        </div>
                                                    </td>

                                                    {/* Bad Hair */}
                                                    <td className="py-3 px-3 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleInfraction(entry.scouter_id, 'hair')}
                                                            disabled={!canEdit}
                                                            className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                                                                entry.hair
                                                                    ? 'bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs'
                                                                    : 'bg-slate-50 text-slate-400 border border-slate-200 hover:border-purple-300 hover:text-slate-700'
                                                            }`}
                                                        >
                                                            {entry.hair ? '-15 Fault' : 'OK'}
                                                        </button>
                                                    </td>

                                                    {/* Bad Trousers (Weekly) or Untidy Tent (Camp) */}
                                                    {!isCamp ? (
                                                        <td className="py-3 px-3 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleInfraction(entry.scouter_id, 'trousers')}
                                                                disabled={!canEdit}
                                                                className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                                                                    entry.trousers
                                                                        ? 'bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs'
                                                                        : 'bg-slate-50 text-slate-400 border border-slate-200 hover:border-purple-300 hover:text-slate-700'
                                                                }`}
                                                            >
                                                                {entry.trousers ? '-15 Fault' : 'OK'}
                                                            </button>
                                                        </td>
                                                    ) : (
                                                        <td className="py-3 px-3 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleInfraction(entry.scouter_id, 'tent_bad')}
                                                                disabled={!canEdit}
                                                                className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                                                                    entry.tent_bad
                                                                        ? 'bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs'
                                                                        : 'bg-slate-50 text-slate-400 border border-slate-200 hover:border-purple-300 hover:text-slate-700'
                                                                }`}
                                                            >
                                                                {entry.tent_bad ? '-20 Fault' : 'OK'}
                                                            </button>
                                                        </td>
                                                    )}

                                                    {/* Bad Uniform */}
                                                    <td className="py-3 px-3 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleInfraction(entry.scouter_id, 'clothes')}
                                                            disabled={!canEdit}
                                                            className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                                                                entry.clothes
                                                                    ? 'bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs'
                                                                    : 'bg-slate-50 text-slate-400 border border-slate-200 hover:border-purple-300 hover:text-slate-700'
                                                            }`}
                                                        >
                                                            {entry.clothes ? '-20 Fault' : 'OK'}
                                                        </button>
                                                    </td>

                                                    {/* Missing Rope */}
                                                    <td className="py-3 px-3 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleInfraction(entry.scouter_id, 'rope')}
                                                            disabled={!canEdit}
                                                            className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                                                                entry.rope
                                                                    ? 'bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs'
                                                                    : 'bg-slate-50 text-slate-400 border border-slate-200 hover:border-purple-300 hover:text-slate-700'
                                                            }`}
                                                        >
                                                            {entry.rope ? (isCamp ? '-15 Fault' : '-10 Fault') : 'OK'}
                                                        </button>
                                                    </td>

                                                    {/* Stepper: Missed Sessions */}
                                                    <td className="py-3 px-3 text-center">
                                                        <div className="inline-flex items-center space-x-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                                                            <button
                                                                type="button"
                                                                onClick={() => stepMissedLectures(entry.scouter_id, -1)}
                                                                disabled={!canEdit || !entry.missed_lectures}
                                                                className="h-6 w-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                                                            >
                                                                <MinusIcon className="h-3 w-3" />
                                                            </button>
                                                            <span
                                                                className={`w-7 text-center font-mono font-bold text-xs ${
                                                                    (entry.missed_lectures || 0) > 0 ? 'text-rose-600' : 'text-slate-600'
                                                                }`}
                                                            >
                                                                {entry.missed_lectures || 0}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => stepMissedLectures(entry.scouter_id, 1)}
                                                                disabled={!canEdit}
                                                                className="h-6 w-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                                                            >
                                                                <PlusIcon className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    </td>

                                                    {/* Live Score */}
                                                    <td className="py-3 px-4 text-center">
                                                        <span
                                                            className={`inline-block font-mono font-black text-sm px-2.5 py-1 rounded-xl border ${scoreStyle.bg}`}
                                                        >
                                                            {score}
                                                        </span>
                                                    </td>

                                                    {/* Status Badge */}
                                                    <td className="py-3 px-4 text-center">
                                                        <span
                                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${scoreStyle.badge}`}
                                                        >
                                                            {scoreStyle.text}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="py-10 text-center text-slate-400">
                                                No scouters found matching the current search or filter.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Mobile / Tablet View: Touch-Friendly Scouter Cards */}
                <div className="block lg:hidden space-y-3">
                    {filteredEntries && filteredEntries.length > 0 ? (
                        filteredEntries.map((entry) => {
                            const score = entry.score ?? 100;
                            const scoreStyle = getScoreStyle(score);

                            return (
                                <Card
                                    key={entry.scouter_id}
                                    padding="p-4"
                                    className="border-purple-100 bg-white shadow-xs space-y-3"
                                >
                                    {/* Top Line: Name, ID, Live Score */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-black text-slate-900 text-sm leading-tight">
                                                {entry.full_name}
                                            </div>
                                            <div className="font-mono text-[10px] text-purple-700 font-bold">
                                                {entry.scout_id || 'ID Pending'}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${scoreStyle.badge}`}>
                                                {scoreStyle.text}
                                            </span>
                                            <span className={`font-mono font-black text-sm px-2.5 py-1 rounded-xl border ${scoreStyle.bg}`}>
                                                {score} pts
                                            </span>
                                        </div>
                                    </div>

                                    {/* Infraction Tap Pills */}
                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        {/* Hair */}
                                        <button
                                            type="button"
                                            onClick={() => toggleInfraction(entry.scouter_id, 'hair')}
                                            disabled={!canEdit}
                                            className={`p-2 rounded-xl text-left text-xs font-semibold border transition-all ${
                                                entry.hair
                                                    ? 'bg-rose-50 border-rose-300 text-rose-800'
                                                    : 'bg-slate-50 border-slate-200 text-slate-600'
                                            }`}
                                        >
                                            <span className="block text-[10px] font-bold uppercase text-slate-400">Hair</span>
                                            <span className="font-bold">{entry.hair ? '-15 Bad Hair' : 'Hair OK'}</span>
                                        </button>

                                        {/* Trousers / Tent */}
                                        {!isCamp ? (
                                            <button
                                                type="button"
                                                onClick={() => toggleInfraction(entry.scouter_id, 'trousers')}
                                                disabled={!canEdit}
                                                className={`p-2 rounded-xl text-left text-xs font-semibold border transition-all ${
                                                    entry.trousers
                                                        ? 'bg-rose-50 border-rose-300 text-rose-800'
                                                        : 'bg-slate-50 border-slate-200 text-slate-600'
                                                }`}
                                            >
                                                <span className="block text-[10px] font-bold uppercase text-slate-400">Trousers</span>
                                                <span className="font-bold">{entry.trousers ? '-15 Bad Trousers' : 'Trousers OK'}</span>
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => toggleInfraction(entry.scouter_id, 'tent_bad')}
                                                disabled={!canEdit}
                                                className={`p-2 rounded-xl text-left text-xs font-semibold border transition-all ${
                                                    entry.tent_bad
                                                        ? 'bg-rose-50 border-rose-300 text-rose-800'
                                                        : 'bg-slate-50 border-slate-200 text-slate-600'
                                                }`}
                                            >
                                                <span className="block text-[10px] font-bold uppercase text-slate-400">Tent / Kit</span>
                                                <span className="font-bold">{entry.tent_bad ? '-20 Untidy Tent' : 'Tent OK'}</span>
                                            </button>
                                        )}

                                        {/* Uniform */}
                                        <button
                                            type="button"
                                            onClick={() => toggleInfraction(entry.scouter_id, 'clothes')}
                                            disabled={!canEdit}
                                            className={`p-2 rounded-xl text-left text-xs font-semibold border transition-all ${
                                                entry.clothes
                                                    ? 'bg-rose-50 border-rose-300 text-rose-800'
                                                    : 'bg-slate-50 border-slate-200 text-slate-600'
                                            }`}
                                        >
                                            <span className="block text-[10px] font-bold uppercase text-slate-400">Uniform</span>
                                            <span className="font-bold">{entry.clothes ? '-20 Bad Uniform' : 'Uniform OK'}</span>
                                        </button>

                                        {/* Rope */}
                                        <button
                                            type="button"
                                            onClick={() => toggleInfraction(entry.scouter_id, 'rope')}
                                            disabled={!canEdit}
                                            className={`p-2 rounded-xl text-left text-xs font-semibold border transition-all ${
                                                entry.rope
                                                    ? 'bg-rose-50 border-rose-300 text-rose-800'
                                                    : 'bg-slate-50 border-slate-200 text-slate-600'
                                            }`}
                                        >
                                            <span className="block text-[10px] font-bold uppercase text-slate-400">Scout Rope</span>
                                            <span className="font-bold">{entry.rope ? (isCamp ? '-15 Missing' : '-10 Missing') : 'Rope OK'}</span>
                                        </button>
                                    </div>

                                    {/* Missed Lectures Stepper */}
                                    <div className="flex items-center justify-between pt-1 text-xs">
                                        <span className="text-slate-500 font-semibold">
                                            {isCamp ? 'Missed Activities (-15 ea)' : 'Missed Lectures (-10 ea)'}
                                        </span>
                                        <div className="inline-flex items-center space-x-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
                                            <button
                                                type="button"
                                                onClick={() => stepMissedLectures(entry.scouter_id, -1)}
                                                disabled={!canEdit || !entry.missed_lectures}
                                                className="h-6 w-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                                            >
                                                <MinusIcon className="h-3 w-3" />
                                            </button>
                                            <span
                                                className={`w-6 text-center font-mono font-bold ${
                                                    (entry.missed_lectures || 0) > 0 ? 'text-rose-600' : 'text-slate-600'
                                                }`}
                                            >
                                                {entry.missed_lectures || 0}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => stepMissedLectures(entry.scouter_id, 1)}
                                                disabled={!canEdit}
                                                className="h-6 w-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                                            >
                                                <PlusIcon className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })
                    ) : (
                        <div className="py-10 text-center text-slate-400 bg-white rounded-2xl border border-purple-100">
                            No scouters found matching this filter.
                        </div>
                    )}
                </div>

                {/* Floating Bottom Action Bar for Quick Saving */}
                {canEdit && (
                    <div className="fixed bottom-4 inset-x-4 md:left-72 md:right-8 z-40">
                        <div className="max-w-4xl mx-auto bg-slate-900/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-xl flex items-center justify-between border border-white/10">
                            <div className="flex items-center space-x-3">
                                <div>
                                    <span className="text-[10px] uppercase font-mono tracking-wider text-purple-300 block">
                                        Fera'a Average
                                    </span>
                                    <span className="text-base font-black font-mono leading-none">
                                        {averageScore}% ({totalScouters} Scouters)
                                    </span>
                                </div>
                                {isDirty && (
                                    <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                                        Unsaved changes
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleSaveEntries}
                                    disabled={saving}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2"
                                >
                                    <CheckIcon className="h-4 w-4 mr-1.5" />
                                    {saving ? 'Saving...' : 'Save Evaluations'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
