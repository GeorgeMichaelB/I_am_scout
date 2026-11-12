import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import Card from '../../Components/Card';
import Button from '../../Components/Button';
import Badge from '../../Components/Badge';
import {
    ArrowLeftIcon,
    CheckIcon,
    CalendarIcon,
    CheckCircleIcon,
    XCircleIcon,
    ShieldExclamationIcon,
    SparklesIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export default function EvaluationsShow({ evaluation, scouterEntries = [], isRestricted = false }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const highestRole = user?.highestRole || user?.highest_role || 'scouter';

    const canEdit = ['dev', 'super_admin', 'admin', 'supervisor', 'leader'].includes(highestRole) && !isRestricted;
    const isCamp = evaluation.type === 'camp';

    // Calculate score based on infractions checked
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

    // Initialize entries with calculated scores
    const [entries, setEntries] = useState(
        scouterEntries.map((e) => ({
            ...e,
            score: calculateScore(e, evaluation.type),
        }))
    );
    const [saving, setSaving] = useState(false);

    const handleCheckboxChange = (index, field) => {
        if (!canEdit) return;
        const updated = [...entries];
        updated[index][field] = !updated[index][field];
        updated[index].score = calculateScore(updated[index], evaluation.type);
        setEntries(updated);
    };

    const handleMissedLecturesChange = (index, val) => {
        if (!canEdit) return;
        const updated = [...entries];
        updated[index].missed_lectures = Math.max(0, parseInt(val) || 0);
        updated[index].score = calculateScore(updated[index], evaluation.type);
        setEntries(updated);
    };

    const handleSaveEntries = (e) => {
        e.preventDefault();
        setSaving(true);
        router.post(
            route('evaluations.entries', evaluation.id),
            { entries },
            {
                preserveScroll: true,
                onFinish: () => setSaving(false),
            }
        );
    };

    const handleToggleActive = () => {
        router.put(route('evaluations.toggle', evaluation.id), {}, { preserveScroll: true });
    };

    // Summary calculations
    const totalScouters = entries.length;
    const perfectScores = entries.filter((e) => e.score === 100).length;
    const averageScore = totalScouters > 0
        ? Math.round(entries.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalScouters)
        : 100;

    return (
        <AuthenticatedLayout header={isCamp ? 'Camp Assessment Sheet' : 'Weekly Assessment Sheet'}>
            <Head title={`Evaluation - ${evaluation.week_date}`} />

            <div className="space-y-6">
                {/* Restricted Access Alert */}
                {isRestricted && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-3">
                        <ShieldExclamationIcon className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-extrabold text-sm block">
                                Evaluation Access Locked by Section Supervisor
                            </span>
                            <span className="text-xs">
                                Your section supervisor has locked evaluation permissions for this Fera'a. You may view existing records, but editing and score modifications are disabled.
                            </span>
                        </div>
                    </div>
                )}

                {/* Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <Link
                        href={route('evaluations.index')}
                        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-scout-800"
                    >
                        <ArrowLeftIcon className="h-4 w-4 mr-1" />
                        Back to Evaluation List
                    </Link>

                    <div className="flex flex-wrap items-center gap-2">
                        {canEdit && (
                            <Button
                                variant={evaluation.is_active ? 'secondary' : 'primary'}
                                size="sm"
                                onClick={handleToggleActive}
                            >
                                {evaluation.is_active ? (
                                    <>
                                        <XCircleIcon className="h-4 w-4 mr-1 text-rose-500" />
                                        Deactivate (Do Not Count)
                                    </>
                                ) : (
                                    <>
                                        <CheckCircleIcon className="h-4 w-4 mr-1 text-emerald-500" />
                                        Activate (Count in Scores)
                                    </>
                                )}
                            </Button>
                        )}

                        {canEdit && (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleSaveEntries}
                                disabled={saving}
                            >
                                <CheckIcon className="h-4 w-4 mr-1.5" />
                                {saving ? 'Saving...' : 'Save Evaluations & Scores'}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Info Card */}
                <Card padding="p-6" className="bg-gradient-to-r from-purple-50 via-white to-purple-50/40 border-purple-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="flex items-center space-x-2 mb-1.5">
                                <Badge variant={isCamp ? 'camp' : 'section'} size="sm">
                                    {isCamp ? 'Camp Evaluation' : 'Weekly Evaluation'}
                                </Badge>
                                <Badge variant={evaluation.is_active ? 'active' : 'inactive'} size="sm">
                                    {evaluation.is_active ? 'Active & Counted' : 'Not Counted'}
                                </Badge>
                                <Badge variant="feraa" size="sm">
                                    {evaluation.feraa?.name}
                                </Badge>
                                <Badge variant="section" size="sm">
                                    {evaluation.feraa?.section?.name}
                                </Badge>
                            </div>
                            <h2 className="text-xl font-black text-slate-900">
                                {isCamp ? (evaluation.camp_name || 'Scout Camp Assessment') : `Week of ${evaluation.week_date}`}
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Date: {evaluation.week_date} • Evaluator: {evaluation.author?.full_name || 'Leader'}
                            </p>
                        </div>

                        <div className="flex items-center space-x-6 text-center">
                            <div>
                                <span className="block text-xl font-black text-scout-900">{totalScouters}</span>
                                <span className="text-[10px] font-bold uppercase text-slate-400">Scouters</span>
                            </div>
                            <div className="h-8 w-px bg-purple-100" />
                            <div>
                                <span className="block text-xl font-black text-emerald-600">{perfectScores}</span>
                                <span className="text-[10px] font-bold uppercase text-slate-400">100% Score</span>
                            </div>
                            <div className="h-8 w-px bg-purple-100" />
                            <div>
                                <span className="block text-xl font-black text-purple-700">{averageScore}%</span>
                                <span className="text-[10px] font-bold uppercase text-slate-400">Fera'a Avg</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Legend Banner */}
                <div className="px-4 py-2.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                    <span className="font-semibold">
                        Scouters start at 100 points. Checking an infraction box deducts points in real time:
                    </span>
                    <span className="font-mono text-[11px] text-amber-800">
                        {isCamp
                            ? 'Hair (-15) • Uniform (-20) • Tent (-20) • Rope (-15) • Missed Activity (-15 ea)'
                            : 'Hair (-15) • Trousers (-15) • Clothes (-20) • Rope (-10) • Missed Lecture (-10 ea)'}
                    </span>
                </div>

                {/* Evaluation Sheet Table */}
                <Card padding="p-0" className="overflow-hidden border-purple-100 bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#FAF7FC] text-slate-600 uppercase tracking-wider font-extrabold text-[10px] border-b border-purple-100">
                                <tr>
                                    <th className="py-3.5 px-4">Scout ID</th>
                                    <th className="py-3.5 px-4">Full Name</th>
                                    <th className="py-3.5 px-4 text-center">
                                        Bad Hair
                                        <span className="block text-[9px] text-rose-500 font-mono font-bold">-15 pts</span>
                                    </th>
                                    {!isCamp ? (
                                        <th className="py-3.5 px-4 text-center">
                                            Bad Trousers
                                            <span className="block text-[9px] text-rose-500 font-mono font-bold">-15 pts</span>
                                        </th>
                                    ) : (
                                        <th className="py-3.5 px-4 text-center">
                                            Untidy Tent / Kit
                                            <span className="block text-[9px] text-rose-500 font-mono font-bold">-20 pts</span>
                                        </th>
                                    )}
                                    <th className="py-3.5 px-4 text-center">
                                        Bad Uniform
                                        <span className="block text-[9px] text-rose-500 font-mono font-bold">-20 pts</span>
                                    </th>
                                    <th className="py-3.5 px-4 text-center">
                                        Missing Rope
                                        <span className="block text-[9px] text-rose-500 font-mono font-bold">{isCamp ? '-15 pts' : '-10 pts'}</span>
                                    </th>
                                    <th className="py-3.5 px-4 text-center">
                                        {isCamp ? 'Missed Activities' : 'Missed Lectures'}
                                        <span className="block text-[9px] text-rose-500 font-mono font-bold">{isCamp ? '-15 ea' : '-10 ea'}</span>
                                    </th>
                                    <th className="py-3.5 px-4 text-center">Current Score</th>
                                    <th className="py-3.5 px-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-purple-50">
                                {entries && entries.length > 0 ? (
                                    entries.map((entry, idx) => {
                                        const score = entry.score ?? 100;
                                        let statusBadgeClass = 'bg-emerald-100 text-emerald-800';
                                        let statusText = 'Excellent';

                                        if (score < 50) {
                                            statusBadgeClass = 'bg-rose-100 text-rose-800';
                                            statusText = 'Failing';
                                        } else if (score < 75) {
                                            statusBadgeClass = 'bg-amber-100 text-amber-800';
                                            statusText = 'Needs Work';
                                        } else if (score < 100) {
                                            statusBadgeClass = 'bg-blue-100 text-blue-800';
                                            statusText = 'Good';
                                        }

                                        return (
                                            <tr key={entry.scouter_id} className="hover:bg-purple-50/30 transition-colors">
                                                <td className="py-3 px-4 font-mono font-bold text-scout-800">
                                                    {entry.scout_id || 'ID Pending'}
                                                </td>
                                                <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                                                    {entry.full_name}
                                                </td>

                                                {/* Checkbox: Bad Hair */}
                                                <td className="py-3 px-4 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={entry.hair}
                                                        onChange={() => handleCheckboxChange(idx, 'hair')}
                                                        disabled={!canEdit}
                                                        title="Check if hair is bad / untidy"
                                                        className="h-4 w-4 rounded-md text-rose-600 focus:ring-rose-500 border-slate-300 cursor-pointer"
                                                    />
                                                </td>

                                                {/* Checkbox: Bad Trousers (Weekly) or Untidy Tent (Camp) */}
                                                {!isCamp ? (
                                                    <td className="py-3 px-4 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={entry.trousers}
                                                            onChange={() => handleCheckboxChange(idx, 'trousers')}
                                                            disabled={!canEdit}
                                                            title="Check if trousers are bad / non-scout"
                                                            className="h-4 w-4 rounded-md text-rose-600 focus:ring-rose-500 border-slate-300 cursor-pointer"
                                                        />
                                                    </td>
                                                ) : (
                                                    <td className="py-3 px-4 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={entry.tent_bad}
                                                            onChange={() => handleCheckboxChange(idx, 'tent_bad')}
                                                            disabled={!canEdit}
                                                            title="Check if tent or kit is untidy / messy"
                                                            className="h-4 w-4 rounded-md text-rose-600 focus:ring-rose-500 border-slate-300 cursor-pointer"
                                                        />
                                                    </td>
                                                )}

                                                {/* Checkbox: Bad Clothes / Uniform */}
                                                <td className="py-3 px-4 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={entry.clothes}
                                                        onChange={() => handleCheckboxChange(idx, 'clothes')}
                                                        disabled={!canEdit}
                                                        title="Check if uniform or clothes are bad / incomplete"
                                                        className="h-4 w-4 rounded-md text-rose-600 focus:ring-rose-500 border-slate-300 cursor-pointer"
                                                    />
                                                </td>

                                                {/* Checkbox: Missing Rope */}
                                                <td className="py-3 px-4 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={entry.rope}
                                                        onChange={() => handleCheckboxChange(idx, 'rope')}
                                                        disabled={!canEdit}
                                                        title="Check if scout rope is missing"
                                                        className="h-4 w-4 rounded-md text-rose-600 focus:ring-rose-500 border-slate-300 cursor-pointer"
                                                    />
                                                </td>

                                                {/* Number Input: Missed Lectures / Activities */}
                                                <td className="py-3 px-4 text-center">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="20"
                                                        value={entry.missed_lectures}
                                                        onChange={(e) => handleMissedLecturesChange(idx, e.target.value)}
                                                        disabled={!canEdit}
                                                        className="w-16 px-2 py-1 text-center font-bold text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                                                    />
                                                </td>

                                                {/* Real-Time Live Score */}
                                                <td className="py-3 px-4 text-center">
                                                    <span
                                                        className={`inline-block font-mono font-black text-sm px-2.5 py-1 rounded-xl ${
                                                            score === 100
                                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                : score >= 75
                                                                ? 'bg-purple-50 text-purple-800 border border-purple-200'
                                                                : score >= 50
                                                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                                                        }`}
                                                    >
                                                        {score} / 100
                                                    </span>
                                                </td>

                                                {/* Status Badge */}
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadgeClass}`}>
                                                        {statusText}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={isCamp ? 8 : 8} className="py-8 text-center text-slate-400">
                                            No scouters registered in this Fera'a yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
