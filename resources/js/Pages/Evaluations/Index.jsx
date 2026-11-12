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
    LockClosedIcon,
    LockOpenIcon,
    AdjustmentsHorizontalIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    CalendarDaysIcon,
    UserGroupIcon,
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
    const [accessPanelOpen, setAccessPanelOpen] = useState(false);

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
            { leader_role_id: leaderRoleId, access_type: accessType },
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
            header="Evaluations & Inspection Center"
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

            <div className="space-y-5">
                {/* Notice for Leaders if Restricted */}
                {isLeader && (!canWeekly || !canCamp) && (
                    <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex items-center justify-between shadow-2xs">
                        <div>
                            <span className="font-extrabold block text-sm">Supervisor Evaluation Notice</span>
                            <span className="mt-0.5 block text-slate-700">
                                {!canWeekly && !canCamp
                                    ? "Evaluation permissions for your Fera'a are currently locked by your Section Supervisor."
                                    : !canWeekly
                                    ? 'Weekly evaluation access is locked. Camp evaluations remain available.'
                                    : 'Camp evaluation access is locked. Weekly evaluations remain available.'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Supervisor Access Control Accordion */}
                {isSupervisorOrAbove && leaderSectionLeaders && leaderSectionLeaders.length > 0 && (
                    <Card padding="p-0" className="overflow-hidden border-purple-200/80 bg-white shadow-xs">
                        <button
                            type="button"
                            onClick={() => setAccessPanelOpen(!accessPanelOpen)}
                            className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-purple-50/20 transition-colors"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="h-9 w-9 rounded-xl bg-[#6B21A8] text-white flex items-center justify-center shrink-0 shadow-xs">
                                    <AdjustmentsHorizontalIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <h3 className="text-sm sm:text-base font-black text-slate-900">
                                            Leader Access Controls
                                        </h3>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                                            {leaderSectionLeaders.length} Leaders
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Toggle weekly and camp inspection permissions for each leader in your section.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 text-slate-500 text-xs font-bold">
                                <span className="hidden sm:inline">
                                    {accessPanelOpen ? 'Hide Controls' : 'Manage Access'}
                                </span>
                                {accessPanelOpen ? (
                                    <ChevronUpIcon className="h-4 w-4" />
                                ) : (
                                    <ChevronDownIcon className="h-4 w-4" />
                                )}
                            </div>
                        </button>

                        {accessPanelOpen && (
                            <div className="p-4 sm:p-5 pt-0 border-t border-purple-100/60 bg-[#FAF7FC]/40">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="text-slate-500 font-extrabold uppercase text-[10px] border-b border-purple-100/60">
                                            <tr>
                                                <th className="py-2.5 px-3">Leader</th>
                                                <th className="py-2.5 px-3">Fera'a & Section</th>
                                                <th className="py-2.5 px-3 text-center">Weekly Access</th>
                                                <th className="py-2.5 px-3 text-center">Camp Access</th>
                                                <th className="py-2.5 px-3 text-right">Master Toggle</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-purple-50/60">
                                            {leaderSectionLeaders.map((ldr) => (
                                                <tr key={ldr.id} className="hover:bg-white/80 transition-colors">
                                                    <td className="py-3 px-3">
                                                        <span className="font-extrabold text-slate-900 block text-sm">
                                                            {ldr.full_name}
                                                        </span>
                                                        <span className="text-[10px] font-mono text-purple-700 font-bold">
                                                            {ldr.scout_id || 'ID Pending'}
                                                        </span>
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
                                                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                                                                    : 'bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100'
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
                                                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                                                                    : 'bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100'
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
                                                    {/* Master Quick Toggle */}
                                                    <td className="py-3 px-3 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleLeaderAccess(ldr.id, 'all')}
                                                            className="text-[11px] font-bold text-[#6B21A8] hover:text-[#581C87] underline"
                                                        >
                                                            {ldr.can_evaluate_weekly && ldr.can_evaluate_camp ? 'Lock Both' : 'Unlock Both'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </Card>
                )}

                {/* Scope Filter Segmented Bar */}
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
                        Weekly Inspections
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

                {/* Desktop View: Evaluations Table */}
                <div className="hidden md:block">
                    <Card padding="p-0" className="overflow-hidden border-purple-100 bg-white shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-[#FAF7FC] text-slate-500 uppercase tracking-wider font-extrabold text-[10px] border-b border-purple-100">
                                    <tr>
                                        <th className="py-3.5 px-4">Type</th>
                                        <th className="py-3.5 px-4">Assessment / Date</th>
                                        <th className="py-3.5 px-4">Fera'a & Section</th>
                                        <th className="py-3.5 px-4">Score Status</th>
                                        <th className="py-3.5 px-4">Scouters</th>
                                        <th className="py-3.5 px-4">Evaluator</th>
                                        <th className="py-3.5 px-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-purple-50/70">
                                    {evaluations.data && evaluations.data.length > 0 ? (
                                        evaluations.data.map((ev) => {
                                            const isCampEv = ev.type === 'camp';
                                            return (
                                                <tr key={ev.id} className="hover:bg-purple-50/30 transition-colors">
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
                                                            {isCampEv ? (ev.camp_name || 'Scout Camp Assessment') : `Week Assessment`}
                                                        </div>
                                                        <div className="text-[11px] font-mono text-slate-400">
                                                            {ev.week_date}
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <div className="font-semibold text-slate-800">
                                                            {ev.feraa?.name || "Fera'a"}
                                                        </div>
                                                        <div className="text-[11px] text-slate-400">
                                                            {ev.feraa?.section?.name || ''}
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <span
                                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                                ev.is_active
                                                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                                    : 'bg-slate-100 text-slate-600'
                                                            }`}
                                                        >
                                                            {ev.is_active ? 'Active & Counted' : 'Not Counted'}
                                                        </span>
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
                                            <td colSpan="7" className="py-10 text-center text-slate-400">
                                                No evaluation sheets found for this view.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {evaluations.links && (
                            <div className="p-4 border-t border-purple-50">
                                <Pagination links={evaluations.links} />
                            </div>
                        )}
                    </Card>
                </div>

                {/* Mobile View: Evaluation Cards */}
                <div className="block md:hidden space-y-3">
                    {evaluations.data && evaluations.data.length > 0 ? (
                        evaluations.data.map((ev) => {
                            const isCampEv = ev.type === 'camp';
                            return (
                                <Card key={ev.id} padding="p-4" className="bg-white border-purple-100 shadow-xs space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-1.5">
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                    isCampEv
                                                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                                        : 'bg-purple-100 text-purple-900 border border-purple-200'
                                                }`}
                                            >
                                                {isCampEv ? 'Camp' : 'Weekly'}
                                            </span>
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                    ev.is_active
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}
                                            >
                                                {ev.is_active ? 'Counted' : 'Not Counted'}
                                            </span>
                                        </div>
                                        <span className="font-mono text-xs text-slate-400">{ev.week_date}</span>
                                    </div>

                                    <div>
                                        <h4 className="font-black text-slate-900 text-base leading-snug">
                                            {isCampEv ? (ev.camp_name || 'Camp Assessment') : `Week Inspection`}
                                        </h4>
                                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                                            {ev.feraa?.name} • {ev.feraa?.section?.name} • {ev.entries?.length || 0} Scouters
                                        </p>
                                    </div>

                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                        <span className="text-xs text-slate-400">
                                            By: {ev.author?.full_name || 'Leader'}
                                        </span>
                                        <Link href={route('evaluations.show', ev.id)}>
                                            <Button variant="primary" size="sm">
                                                Open Sheet
                                                <ArrowUpRightIcon className="h-3 w-3 ml-1" />
                                            </Button>
                                        </Link>
                                    </div>
                                </Card>
                            );
                        })
                    ) : (
                        <div className="py-10 text-center text-slate-400 bg-white rounded-2xl border border-purple-100">
                            No evaluation sheets found.
                        </div>
                    )}

                    {evaluations.links && (
                        <div className="pt-2">
                            <Pagination links={evaluations.links} />
                        </div>
                    )}
                </div>
            </div>

            {/* Modal: Create Assessment Sheet */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Assessment Sheet">
                <form onSubmit={handleCreate} className="space-y-4">
                    <Select
                        label="Evaluation Type"
                        value={data.type}
                        onChange={(e) => setData('type', e.target.value)}
                        required
                    >
                        <option value="weekly" disabled={isLeader && !canWeekly}>
                            Weekly Gathering Inspection {!canWeekly && isLeader ? '(Restricted)' : ''}
                        </option>
                        <option value="camp" disabled={isLeader && !canCamp}>
                            Camp Evaluation {!canCamp && isLeader ? '(Restricted)' : ''}
                        </option>
                    </Select>

                    {data.type === 'camp' && (
                        <Input
                            label="Camp Name or Destination"
                            placeholder="e.g. Annual Desert Spring Camp"
                            value={data.camp_name}
                            onChange={(e) => setData('camp_name', e.target.value)}
                            required
                        />
                    )}

                    <Select
                        label="Select Target Fera'a"
                        value={data.feraa_id}
                        onChange={(e) => setData('feraa_id', e.target.value)}
                        required
                    >
                        <option value="">Choose Fera'a</option>
                        {isSupervisorOrAbove && (
                            <option value="all">All Fera'as (Create Camp Sheet for Entire Section)</option>
                        )}
                        {feraas.map((f) => (
                            <option key={f.id} value={f.id}>
                                {f.name} ({f.section?.name})
                            </option>
                        ))}
                    </Select>

                    <Input
                        label="Inspection Date"
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
                            className="rounded-lg text-[#6B21A8] focus:ring-purple-500 h-4 w-4 border-slate-300"
                        />
                        <label htmlFor="is_active_check" className="text-xs font-semibold text-slate-700 cursor-pointer">
                            Activate evaluation (count towards scouter cumulative scores)
                        </label>
                    </div>

                    <div className="flex justify-end space-x-2 pt-3">
                        <Button variant="secondary" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={processing}>
                            {processing ? 'Creating...' : 'Create & Open Sheet'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
