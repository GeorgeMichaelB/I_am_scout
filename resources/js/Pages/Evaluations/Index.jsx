import React, { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import Card from '../../Components/Card';
import Button from '../../Components/Button';
import Badge from '../../Components/Badge';
import Modal from '../../Components/Modal';
import Input from '../../Components/Input';
import Select from '../../Components/Select';
import Pagination from '../../Components/Pagination';
import {
    PlusIcon,
    ClipboardDocumentCheckIcon,
    ArrowUpRightIcon,
    CheckCircleIcon,
    XCircleIcon,
    ShieldCheckIcon,
    AdjustmentsHorizontalIcon,
    SparklesIcon,
    LockClosedIcon,
    LockOpenIcon,
} from '@heroicons/react/24/outline';

export default function EvaluationsIndex({
    evaluations,
    feraas = [],
    canWeekly = true,
    canCamp = true,
    leaderSectionLeaders = [],
    currentFilter = {},
}) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const highestRole = user?.highestRole || user?.highest_role || 'scouter';

    const isSupervisorOrAbove = ['dev', 'super_admin', 'admin', 'supervisor'].includes(highestRole);
    const isLeader = highestRole === 'leader';
    const canCreate = (isLeader && (canWeekly || canCamp)) || isSupervisorOrAbove;

    const [modalOpen, setModalOpen] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        feraa_id: feraas[0]?.id || '',
        type: canWeekly ? 'weekly' : 'camp',
        camp_name: '',
        week_date: new Date().toISOString().split('T')[0],
        is_active: true,
    });

    const handleCreate = (e) => {
        e.preventDefault();
        post(route('evaluations.store'), {
            onSuccess: () => {
                setModalOpen(false);
                reset();
            },
        });
    };

    const handleToggleLeaderAccess = (leaderRoleId, accessType) => {
        router.post(
            route('evaluations.toggle-leader-access', leaderRoleId),
            { access_type: accessType },
            { preserveScroll: true }
        );
    };

    const handleFilterType = (type) => {
        router.get(
            route('evaluations.index'),
            { type: type || undefined },
            { preserveState: true }
        );
    };

    const activeFilter = currentFilter.type || '';

    return (
        <AuthenticatedLayout
            header="Evaluations & Attendance Center"
            actionButton={
                canCreate && (
                    <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
                        <PlusIcon className="h-4 w-4 mr-1.5" />
                        New Assessment Sheet
                    </Button>
                )
            }
        >
            <Head title="Evaluations & Assessments" />

            <div className="space-y-6">
                {/* Leader Notice if Restricted */}
                {isLeader && (!canWeekly || !canCamp) && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                        <div>
                            <span className="font-extrabold block">Notice from Section Supervisor</span>
                            <span>
                                {!canWeekly && !canCamp
                                    ? 'All evaluation access for your Fera\'a has been temporarily locked by your Section Supervisor.'
                                    : !canWeekly
                                    ? 'Weekly evaluation access is currently restricted. Camp evaluations remain available.'
                                    : 'Camp evaluation access is currently restricted. Weekly evaluations remain available.'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Supervisor Access Control Panel */}
                {isSupervisorOrAbove && leaderSectionLeaders && leaderSectionLeaders.length > 0 && (
                    <Card padding="p-6" className="bg-gradient-to-r from-purple-50/80 via-white to-purple-50/40 border-purple-200 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-purple-100">
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-2xl bg-[#6B21A8] text-white flex items-center justify-center shrink-0 shadow-sm">
                                    <AdjustmentsHorizontalIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900 flex items-center">
                                        Supervisor Access Control • Leader Permissions
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Toggle who can access Weekly and Camp Evaluations for each Fera'a.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto mt-4">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-purple-50/60 text-slate-600 font-extrabold uppercase text-[10px]">
                                    <tr>
                                        <th className="py-2.5 px-3 rounded-l-xl">Leader</th>
                                        <th className="py-2.5 px-3">Fera'a & Section</th>
                                        <th className="py-2.5 px-3 text-center">Weekly Evaluation</th>
                                        <th className="py-2.5 px-3 text-center">Camp Evaluation</th>
                                        <th className="py-2.5 px-3 text-right rounded-r-xl">Master Toggle</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-purple-50">
                                    {leaderSectionLeaders.map((ldr) => (
                                        <tr key={ldr.id} className="hover:bg-purple-50/20 transition-colors">
                                            <td className="py-3 px-3">
                                                <span className="font-extrabold text-slate-900 block">{ldr.full_name}</span>
                                                <span className="text-[10px] font-mono text-purple-700">{ldr.scout_id}</span>
                                            </td>
                                            <td className="py-3 px-3">
                                                <span className="font-semibold text-slate-800">{ldr.feraa_name}</span>
                                                <span className="text-[11px] text-slate-400 block">{ldr.section_name}</span>
                                            </td>
                                            {/* Weekly Toggle */}
                                            <td className="py-3 px-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleLeaderAccess(ldr.id, 'weekly')}
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                                                        ldr.can_evaluate_weekly
                                                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                                                            : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                                                    }`}
                                                >
                                                    {ldr.can_evaluate_weekly ? (
                                                        <>
                                                            <LockOpenIcon className="h-3 w-3 mr-1" />
                                                            Allowed
                                                        </>
                                                    ) : (
                                                        <>
                                                            <LockClosedIcon className="h-3 w-3 mr-1" />
                                                            Locked
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                            {/* Camp Toggle */}
                                            <td className="py-3 px-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleLeaderAccess(ldr.id, 'camp')}
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                                                        ldr.can_evaluate_camp
                                                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                                                            : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                                                    }`}
                                                >
                                                    {ldr.can_evaluate_camp ? (
                                                        <>
                                                            <LockOpenIcon className="h-3 w-3 mr-1" />
                                                            Allowed
                                                        </>
                                                    ) : (
                                                        <>
                                                            <LockClosedIcon className="h-3 w-3 mr-1" />
                                                            Locked
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                            {/* Master All Toggle */}
                                            <td className="py-3 px-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleLeaderAccess(ldr.id, 'all')}
                                                    className="text-[11px] font-bold text-scout-800 hover:text-purple-950 underline"
                                                >
                                                    {ldr.can_evaluate_weekly && ldr.can_evaluate_camp ? 'Lock Both' : 'Unlock Both'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => handleFilterType('')}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                            activeFilter === ''
                                ? 'bg-[#6B21A8] text-white shadow-xs'
                                : 'bg-white border border-purple-100 text-slate-600 hover:bg-purple-50'
                        }`}
                    >
                        All Assessments
                    </button>
                    <button
                        type="button"
                        onClick={() => handleFilterType('weekly')}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                            activeFilter === 'weekly'
                                ? 'bg-[#6B21A8] text-white shadow-xs'
                                : 'bg-white border border-purple-100 text-slate-600 hover:bg-purple-50'
                        }`}
                    >
                        Weekly Gatherings
                    </button>
                    <button
                        type="button"
                        onClick={() => handleFilterType('camp')}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                            activeFilter === 'camp'
                                ? 'bg-[#6B21A8] text-white shadow-xs'
                                : 'bg-white border border-purple-100 text-slate-600 hover:bg-purple-50'
                        }`}
                    >
                        Camp Evaluations
                    </button>
                </div>

                {/* Evaluations Table */}
                <Card padding="p-0" className="overflow-hidden border-purple-100 bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#FAF7FC] text-slate-500 uppercase tracking-wider font-extrabold text-[10px] border-b border-purple-100">
                                <tr>
                                    <th className="py-3.5 px-4">Type</th>
                                    <th className="py-3.5 px-4">Assessment / Date</th>
                                    <th className="py-3.5 px-4">Fera'a & Section</th>
                                    <th className="py-3.5 px-4">Counting Status</th>
                                    <th className="py-3.5 px-4">Entries Count</th>
                                    <th className="py-3.5 px-4">Evaluator</th>
                                    <th className="py-3.5 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-purple-50">
                                {evaluations.data && evaluations.data.length > 0 ? (
                                    evaluations.data.map((ev) => {
                                        const isCampEv = ev.type === 'camp';
                                        return (
                                            <tr key={ev.id} className="hover:bg-purple-50/40 transition-colors">
                                                <td className="py-3.5 px-4">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                            isCampEv
                                                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                                                : 'bg-purple-100 text-purple-900 border border-purple-200'
                                                        }`}
                                                    >
                                                        {isCampEv ? 'Camp' : 'Weekly'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="font-extrabold text-slate-900 text-sm">
                                                        {isCampEv ? (ev.camp_name || 'Scout Camp') : `Week Assessment`}
                                                    </div>
                                                    <div className="text-[11px] font-mono text-slate-400">
                                                        {ev.week_date}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="font-semibold text-slate-800">
                                                        {ev.feraa?.name || 'Fera\'a'}
                                                    </div>
                                                    <div className="text-[11px] text-slate-400">
                                                        {ev.feraa?.section?.name || ''}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <Badge variant={ev.is_active ? 'active' : 'inactive'} size="sm">
                                                        {ev.is_active ? 'Active & Counted' : 'Not Counted'}
                                                    </Badge>
                                                </td>
                                                <td className="py-3.5 px-4 font-semibold text-slate-700">
                                                    {ev.entries?.length || 0} Scouters
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-600">
                                                    {ev.author?.full_name || 'Leader'}
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <Link href={route('evaluations.show', ev.id)}>
                                                        <Button variant="primary" size="sm">
                                                            Open Sheet
                                                            <ArrowUpRightIcon className="h-3 w-3 ml-1" />
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="py-8 text-center text-slate-400">
                                            No evaluation sheets found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t border-purple-50">
                        <Pagination links={evaluations.links} />
                    </div>
                </Card>
            </div>

            {/* Modal: New Evaluation Sheet */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Assessment Sheet">
                <form onSubmit={handleCreate} className="space-y-4">
                    <Select
                        label="Evaluation Scope"
                        value={data.type}
                        onChange={(e) => setData('type', e.target.value)}
                        required
                    >
                        <option value="weekly" disabled={isLeader && !canWeekly}>
                            Weekly Gathering Inspection {!canWeekly && isLeader ? '(Restricted by Supervisor)' : ''}
                        </option>
                        <option value="camp" disabled={isLeader && !canCamp}>
                            Camp Evaluation {!canCamp && isLeader ? '(Restricted by Supervisor)' : ''}
                        </option>
                    </Select>

                    {data.type === 'camp' && (
                        <Input
                            label="Camp Name / Location"
                            placeholder="e.g. Annual Spring Desert Camp"
                            value={data.camp_name}
                            onChange={(e) => setData('camp_name', e.target.value)}
                            required
                        />
                    )}

                    <Select
                        label="Select Fera'a"
                        value={data.feraa_id}
                        onChange={(e) => setData('feraa_id', e.target.value)}
                        required
                    >
                        <option value="">Choose Fera'a</option>
                        {feraas.map((f) => (
                            <option key={f.id} value={f.id}>
                                {f.name} ({f.section?.name})
                            </option>
                        ))}
                    </Select>

                    <Input
                        label="Assessment Date"
                        type="date"
                        value={data.week_date}
                        onChange={(e) => setData('week_date', e.target.value)}
                        required
                    />

                    <div className="flex items-center space-x-2 pt-1">
                        <input
                            type="checkbox"
                            id="is_active_check"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="rounded-lg text-scout-800 focus:ring-purple-500 h-4 w-4 border-slate-300"
                        />
                        <label htmlFor="is_active_check" className="text-xs font-semibold text-slate-700 cursor-pointer">
                            Activate evaluation (count in scouter cumulative scores)
                        </label>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                        <Button variant="secondary" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={processing}>
                            {processing ? 'Creating...' : 'Create & Open Assessment'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
