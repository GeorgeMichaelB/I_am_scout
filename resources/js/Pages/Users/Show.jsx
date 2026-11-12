import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import Card from '../../Components/Card';
import Button from '../../Components/Button';
import Input from '../../Components/Input';
import Select from '../../Components/Select';
import Badge from '../../Components/Badge';
import { ArrowLeftIcon, PencilSquareIcon, CheckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function UsersShow({ scouter, sections = [], scoreStats = null }) {
    const { auth } = usePage().props;
    const currentUser = auth?.user;
    const highestRole = currentUser?.highestRole || currentUser?.highest_role || 'scouter';

    const [isEditing, setIsEditing] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        scout_id: scouter.scout_id || '',
        full_name: scouter.full_name || '',
        email: scouter.email || '',
        gender: scouter.gender || 'male',
        phone: scouter.phone || '',
        mom_phone: scouter.mom_phone || '',
        dad_phone: scouter.dad_phone || '',
        school: scouter.school || '',
        grade: scouter.grade || '',
        sunday_school_family: scouter.sunday_school_family || '',
        address: scouter.address || '',
        diseases: scouter.diseases || '',
        notes: scouter.notes || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('users.update', scouter.id), {
            onSuccess: () => setIsEditing(false),
        });
    };

    return (
        <AuthenticatedLayout header={scouter.full_name}>
            <Head title={`Scouter - ${scouter.full_name}`} />

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Link
                        href={isLeaderOrAbove ? route('users.index') : route('dashboard')}
                        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-scout-800"
                    >
                        <ArrowLeftIcon className="h-4 w-4 mr-1" />
                        {isLeaderOrAbove ? 'Back to Scouter Directory' : 'Back to Dashboard'}
                    </Link>

                    <Button
                        variant={isEditing ? 'secondary' : 'primary'}
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        <PencilSquareIcon className="h-4 w-4 mr-1.5" />
                        {isEditing ? 'Cancel Editing' : 'Edit Information'}
                    </Button>
                </div>

                {/* Profile Header Card */}
                <Card padding="p-6" className="bg-gradient-to-r from-purple-50 via-white to-purple-50/50 border-purple-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <div className="h-16 w-16 rounded-3xl bg-[#6B21A8] text-white flex items-center justify-center text-2xl font-black shadow-md">
                                {scouter.full_name ? scouter.full_name[0] : 'S'}
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900">{scouter.full_name}</h2>
                                <span className="font-mono text-xs font-bold text-scout-700 block mt-0.5">
                                    Scout ID: {scouter.scout_id || 'ID Pending'}
                                </span>
                                <span className="text-xs text-slate-400">{scouter.email}</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                            {scouter.roles?.map((r) => (
                                <Badge key={r.id} variant={r.role} size="md">
                                    {r.role} {r.section ? `• ${r.section.name}` : ''} {r.feraa ? `• ${r.feraa.name}` : ''}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Evaluation & Attendance Scorecard */}
                {scoreStats && (
                    <Card padding="p-6" className="border-purple-200 bg-gradient-to-r from-purple-50/70 via-white to-purple-50/30">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-purple-100">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                                    Official Scout Scorecard
                                </span>
                                <h3 className="text-xl font-black text-slate-900 mt-1">
                                    Discipline, Attendance & Evaluation Score
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Cumulative assessment score managed across all weekly inspections and camp evaluations.
                                </p>
                            </div>

                            <div className="flex items-center space-x-3 bg-white px-4 py-2.5 rounded-2xl border border-purple-100 shadow-2xs">
                                <div>
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block text-right">
                                        Cumulative Score
                                    </span>
                                    <span className="text-2xl font-black text-[#6B21A8] block text-right font-mono leading-none">
                                        {scoreStats.overall_score}%
                                    </span>
                                </div>
                                <div className="h-8 w-px bg-purple-100" />
                                <Badge variant={scoreStats.overall_score >= 80 ? 'active' : 'inactive'} size="sm">
                                    {scoreStats.rank_tier}
                                </Badge>
                            </div>
                        </div>

                        {/* Metric Tiles */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                            <div className="p-3 rounded-2xl bg-white border border-purple-100">
                                <span className="text-[10px] font-bold uppercase text-slate-400 block">Weekly Average</span>
                                <span className="text-lg font-black text-slate-900 font-mono mt-0.5 block">
                                    {scoreStats.weekly_average}%
                                </span>
                                <span className="text-[10px] text-slate-500">
                                    {scoreStats.weekly_count} inspections
                                </span>
                            </div>

                            <div className="p-3 rounded-2xl bg-white border border-purple-100">
                                <span className="text-[10px] font-bold uppercase text-slate-400 block">Camp Average</span>
                                <span className="text-lg font-black text-slate-900 font-mono mt-0.5 block">
                                    {scoreStats.camp_average}%
                                </span>
                                <span className="text-[10px] text-slate-500">
                                    {scoreStats.camp_count} camp sessions
                                </span>
                            </div>

                            <div className="p-3 rounded-2xl bg-white border border-purple-100">
                                <span className="text-[10px] font-bold uppercase text-slate-400 block">Attendance Rate</span>
                                <span className="text-lg font-black text-emerald-700 font-mono mt-0.5 block">
                                    {scoreStats.attendance_rate}%
                                </span>
                                <span className="text-[10px] text-slate-500">
                                    {scoreStats.total_missed_lectures} missed sessions
                                </span>
                            </div>

                            <div className="p-3 rounded-2xl bg-white border border-purple-100">
                                <span className="text-[10px] font-bold uppercase text-slate-400 block">Recorded Infractions</span>
                                <span className="text-lg font-black text-rose-700 font-mono mt-0.5 block">
                                    {scoreStats.total_infractions}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                    deductions applied
                                </span>
                            </div>
                        </div>

                        {/* Evaluation History Table */}
                        {scoreStats.history && scoreStats.history.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-purple-100">
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                                    Recorded Evaluation Sheets ({scoreStats.history.length})
                                </h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-purple-50/60 text-slate-600 font-extrabold uppercase text-[10px]">
                                            <tr>
                                                <th className="py-2 px-3 rounded-l-xl">Type</th>
                                                <th className="py-2 px-3">Date & Assessment</th>
                                                <th className="py-2 px-3">Infractions Noted</th>
                                                <th className="py-2 px-3 text-center">Score</th>
                                                <th className="py-2 px-3 text-right rounded-r-xl">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-purple-50">
                                            {scoreStats.history.map((h) => {
                                                const infractions = [];
                                                if (h.hair) infractions.push('Bad Hair');
                                                if (h.trousers) infractions.push('Bad Trousers');
                                                if (h.clothes) infractions.push('Bad Uniform');
                                                if (h.rope) infractions.push('Missing Rope');
                                                if (h.tent_bad) infractions.push('Untidy Tent');
                                                if (h.missed_lectures > 0) infractions.push(`${h.missed_lectures} Missed`);

                                                return (
                                                    <tr key={h.id} className="hover:bg-purple-50/20">
                                                        <td className="py-2 px-3">
                                                            <span
                                                                className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                                                    h.type === 'camp'
                                                                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                                                        : 'bg-purple-100 text-purple-900 border border-purple-200'
                                                                }`}
                                                            >
                                                                {h.type === 'camp' ? 'Camp' : 'Weekly'}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 px-3">
                                                            <span className="font-bold text-slate-900 block">{h.name}</span>
                                                            <span className="text-[10px] text-slate-400 font-mono">{h.date}</span>
                                                        </td>
                                                        <td className="py-2 px-3">
                                                            {infractions.length > 0 ? (
                                                                <span className="text-[11px] text-rose-700 font-medium">
                                                                    {infractions.join(', ')}
                                                                </span>
                                                            ) : (
                                                                <span className="text-[11px] text-emerald-700 font-medium">
                                                                    Clean Inspection
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-2 px-3 text-center">
                                                            <span className="font-mono font-black text-xs text-scout-800">
                                                                {h.score} / 100
                                                            </span>
                                                        </td>
                                                        <td className="py-2 px-3 text-right">
                                                            <Link
                                                                href={route('evaluations.show', h.evaluation_id)}
                                                                className="text-[11px] font-bold text-scout-800 hover:text-purple-950 underline"
                                                            >
                                                                View Sheet
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </Card>
                )}

                {/* Details Form / Display */}
                <Card padding="p-8" className="border-purple-100">
                    <form onSubmit={submit} className="space-y-6">
                        {/* Scouting & Personal */}
                        <div>
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 pb-2 border-b border-purple-50 mb-4">
                                Scout Identity & Gender
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Input
                                    label="Unique Scout ID"
                                    value={data.scout_id}
                                    disabled={!isEditing}
                                    onChange={(e) => setData('scout_id', e.target.value)}
                                    error={errors.scout_id}
                                />
                                <Input
                                    label="Full Name"
                                    value={data.full_name}
                                    disabled={!isEditing}
                                    onChange={(e) => setData('full_name', e.target.value)}
                                    error={errors.full_name}
                                />
                                <Select
                                    label="Gender"
                                    value={data.gender}
                                    disabled={!isEditing}
                                    onChange={(e) => setData('gender', e.target.value)}
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </Select>
                            </div>
                        </div>

                        {/* Contacts */}
                        <div>
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 pb-2 border-b border-purple-50 mb-4">
                                Contact Information
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Input
                                    label="Personal Phone"
                                    value={data.phone}
                                    disabled={!isEditing}
                                    onChange={(e) => setData('phone', e.target.value)}
                                />
                                <Input
                                    label="Mom's Phone"
                                    value={data.mom_phone}
                                    disabled={!isEditing}
                                    onChange={(e) => setData('mom_phone', e.target.value)}
                                />
                                <Input
                                    label="Dad's Phone"
                                    value={data.dad_phone}
                                    disabled={!isEditing}
                                    onChange={(e) => setData('dad_phone', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* School & Church */}
                        <div>
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 pb-2 border-b border-purple-50 mb-4">
                                School & Church Group
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Input
                                    label="School"
                                    value={data.school}
                                    disabled={!isEditing}
                                    onChange={(e) => setData('school', e.target.value)}
                                />
                                <Input
                                    label="Grade"
                                    value={data.grade}
                                    disabled={!isEditing}
                                    onChange={(e) => setData('grade', e.target.value)}
                                />
                                <Input
                                    label="Sunday School Family"
                                    value={data.sunday_school_family}
                                    disabled={!isEditing}
                                    onChange={(e) => setData('sunday_school_family', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Address & Medical */}
                        <div>
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 pb-2 border-b border-purple-50 mb-4">
                                Address, Medical & Scout Notes
                            </h3>
                            <div className="space-y-4">
                                <Input
                                    label="Home Address"
                                    value={data.address}
                                    disabled={!isEditing}
                                    onChange={(e) => setData('address', e.target.value)}
                                />

                                <Input
                                    label="Diseases & Health Notes"
                                    value={data.diseases}
                                    disabled={!isEditing}
                                    onChange={(e) => setData('diseases', e.target.value)}
                                />

                                <div>
                                    <label className="block text-xs font-semibold tracking-wide uppercase text-slate-600 mb-1.5">
                                        Leader Notes
                                    </label>
                                    <textarea
                                        rows={3}
                                        disabled={!isEditing}
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 disabled:opacity-75 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
                                    />
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
                                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" disabled={processing}>
                                    <CheckIcon className="h-4 w-4 mr-1.5" />
                                    {processing ? 'Saving Changes...' : 'Save Changes'}
                                </Button>
                            </div>
                        )}
                    </form>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}

