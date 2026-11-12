import React, { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import Card from '../../Components/Card';
import Button from '../../Components/Button';
import Badge from '../../Components/Badge';
import {
    ArrowLeftIcon,
    CheckIcon,
    ArrowPathIcon,
    CalendarIcon,
    CheckCircleIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';

export default function EvaluationsShow({ evaluation, scouterEntries = [] }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const highestRole = user?.highestRole || 'scouter';

    const canEdit = ['dev', 'super_admin', 'admin', 'supervisor', 'leader'].includes(highestRole);

    const [entries, setEntries] = useState(scouterEntries);
    const [saving, setSaving] = useState(false);

    const handleCheckboxChange = (index, field) => {
        if (!canEdit) return;
        const updated = [...entries];
        updated[index][field] = !updated[index][field];
        setEntries(updated);
    };

    const handleMissedLecturesChange = (index, val) => {
        if (!canEdit) return;
        const updated = [...entries];
        updated[index].missed_lectures = Math.max(0, parseInt(val) || 0);
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

    // Calculate totals for quick summary
    const totalScouters = entries.length;
    const fullAttendance = entries.filter((e) => e.hair && e.trousers && e.clothes && e.rope && e.missed_lectures === 0).length;

    return (
        <AuthenticatedLayout header="Weekly Assessment Sheet">
            <Head title={`Evaluation - ${evaluation.week_date}`} />

            <div className="space-y-6">
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
                                {saving ? 'Saving...' : 'Save Evaluations'}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Info Card */}
                <Card padding="p-6" className="bg-gradient-to-r from-purple-50 via-white to-purple-50/40 border-purple-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="flex items-center space-x-2 mb-1.5">
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
                                Week of {evaluation.week_date}
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Taken by {evaluation.author?.full_name || 'Leader'}
                            </p>
                        </div>

                        <div className="flex items-center space-x-6 text-center">
                            <div>
                                <span className="block text-xl font-black text-scout-900">{totalScouters}</span>
                                <span className="text-[10px] font-bold uppercase text-slate-400">Total Scouters</span>
                            </div>
                            <div className="h-8 w-px bg-purple-100" />
                            <div>
                                <span className="block text-xl font-black text-emerald-600">{fullAttendance}</span>
                                <span className="text-[10px] font-bold uppercase text-slate-400">Full Uniform</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Evaluation Sheet Table */}
                <Card padding="p-0" className="overflow-hidden border-purple-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#FAF7FC] text-slate-600 uppercase tracking-wider font-extrabold text-[10px] border-b border-purple-100">
                                <tr>
                                    <th className="py-3.5 px-4">Scout ID</th>
                                    <th className="py-3.5 px-4">Full Name</th>
                                    <th className="py-3.5 px-4 text-center">Hair Trimmed</th>
                                    <th className="py-3.5 px-4 text-center">Scout Trousers</th>
                                    <th className="py-3.5 px-4 text-center">Scout Clothes</th>
                                    <th className="py-3.5 px-4 text-center">Scout Rope</th>
                                    <th className="py-3.5 px-4 text-center">Missed Lectures</th>
                                    <th className="py-3.5 px-4 text-center">Total Pass</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-purple-50">
                                {entries && entries.length > 0 ? (
                                    entries.map((entry, idx) => {
                                        const uniformPass = entry.hair && entry.trousers && entry.clothes && entry.rope;
                                        return (
                                            <tr key={entry.scouter_id} className="hover:bg-purple-50/30 transition-colors">
                                                <td className="py-3 px-4 font-mono font-bold text-scout-800">
                                                    {entry.scout_id || 'ID Pending'}
                                                </td>
                                                <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                                                    {entry.full_name}
                                                </td>

                                                {/* Checkbox: Hair */}
                                                <td className="py-3 px-4 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={entry.hair}
                                                        onChange={() => handleCheckboxChange(idx, 'hair')}
                                                        disabled={!canEdit}
                                                        className="h-4 w-4 rounded-md text-scout-800 focus:ring-purple-500 border-slate-300 cursor-pointer"
                                                    />
                                                </td>

                                                {/* Checkbox: Trousers */}
                                                <td className="py-3 px-4 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={entry.trousers}
                                                        onChange={() => handleCheckboxChange(idx, 'trousers')}
                                                        disabled={!canEdit}
                                                        className="h-4 w-4 rounded-md text-scout-800 focus:ring-purple-500 border-slate-300 cursor-pointer"
                                                    />
                                                </td>

                                                {/* Checkbox: Clothes */}
                                                <td className="py-3 px-4 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={entry.clothes}
                                                        onChange={() => handleCheckboxChange(idx, 'clothes')}
                                                        disabled={!canEdit}
                                                        className="h-4 w-4 rounded-md text-scout-800 focus:ring-purple-500 border-slate-300 cursor-pointer"
                                                    />
                                                </td>

                                                {/* Checkbox: Rope */}
                                                <td className="py-3 px-4 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={entry.rope}
                                                        onChange={() => handleCheckboxChange(idx, 'rope')}
                                                        disabled={!canEdit}
                                                        className="h-4 w-4 rounded-md text-scout-800 focus:ring-purple-500 border-slate-300 cursor-pointer"
                                                    />
                                                </td>

                                                {/* Missed Lectures Number Input */}
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

                                                {/* Total Result Badge */}
                                                <td className="py-3 px-4 text-center">
                                                    {uniformPass && entry.missed_lectures === 0 ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                                            Complete
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                                                            Notice
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="py-8 text-center text-slate-400">
                                            No scouters assigned to this Fera'a yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {canEdit && (
                        <div className="p-4 bg-slate-50/60 border-t border-purple-50 flex justify-end">
                            <Button
                                variant="primary"
                                size="md"
                                onClick={handleSaveEntries}
                                disabled={saving}
                            >
                                <CheckIcon className="h-4 w-4 mr-1.5" />
                                {saving ? 'Saving...' : 'Save All Evaluations'}
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
