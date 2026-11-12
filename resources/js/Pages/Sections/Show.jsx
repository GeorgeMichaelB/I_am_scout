import React, { useState } from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import Card from '../../Components/Card';
import Button from '../../Components/Button';
import Badge from '../../Components/Badge';
import Modal from '../../Components/Modal';
import Input from '../../Components/Input';
import Select from '../../Components/Select';
import {
    PlusIcon,
    UserPlusIcon,
    TrashIcon,
    ArrowDownTrayIcon,
    ArrowUpTrayIcon,
    UsersIcon,
    ShieldCheckIcon,
    UserMinusIcon,
    ArrowPathIcon,
    CheckIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

export default function SectionsShow({ section, eligibleLeaders = [], allMembers = [] }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const highestRole = user?.highestRole || user?.highest_role || 'scouter';

    const isAdminOrSuper = ['dev', 'super_admin', 'admin'].includes(highestRole);
    const isSectionSupervisor = user?.roles?.some(
        (r) => r.role === 'supervisor' && r.section_id === section.id
    );
    const canManageSection = isAdminOrSuper || isSectionSupervisor;

    // Supervisors assigned to this section (supports multiple supervisors)
    const supervisorRoles = section.user_roles?.filter((r) => r.role === 'supervisor') || [];
    const supervisors = supervisorRoles.map((r) => ({
        ...r.user,
        role_id: r.id,
    })).filter((s) => Boolean(s.id));

    // 1. Assign Supervisor Modal State
    const [supervisorModalOpen, setSupervisorModalOpen] = useState(false);
    const {
        data: supervisorData,
        setData: setSupervisorData,
        post: postSupervisor,
        processing: supervisorProcessing,
        reset: resetSupervisor,
    } = useForm({
        user_id: '',
    });

    const handleAssignSupervisor = (e) => {
        e.preventDefault();
        postSupervisor(route('sections.assign-supervisor', section.id), {
            onSuccess: () => {
                setSupervisorModalOpen(false);
                resetSupervisor();
            },
        });
    };

    const handleRemoveSupervisor = (userId, userName) => {
        if (confirm(`Remove ${userName} as Supervisor of ${section.name}?`)) {
            router.delete(route('sections.remove-supervisor', [section.id, userId]));
        }
    };

    // 2. Create Fera'a Modal State
    const [createFeraaOpen, setCreateFeraaOpen] = useState(false);
    const {
        data: feraaData,
        setData: setFeraaData,
        post: postFeraa,
        processing: feraaProcessing,
        reset: resetFeraa,
    } = useForm({
        name: '',
    });

    const handleCreateFeraa = (e) => {
        e.preventDefault();
        postFeraa(route('feraas.store', section.id), {
            onSuccess: () => {
                setCreateFeraaOpen(false);
                resetFeraa();
            },
        });
    };

    // 3. Assign Leader to Fera'a Modal State
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [targetFeraa, setTargetFeraa] = useState(null);
    const {
        data: assignData,
        setData: setAssignData,
        post: postAssign,
        processing: assignProcessing,
        reset: resetAssign,
    } = useForm({
        user_id: '',
    });

    const openAssignModal = (feraa) => {
        setTargetFeraa(feraa);
        assignData.user_id = '';
        setAssignModalOpen(true);
    };

    const handleAssignLeader = (e) => {
        e.preventDefault();
        if (!targetFeraa) return;
        postAssign(route('feraas.assign-leader', targetFeraa.id), {
            onSuccess: () => {
                setAssignModalOpen(false);
                resetAssign();
            },
        });
    };

    const handleRemoveLeader = (feraaId, leaderId, leaderName) => {
        if (confirm(`Remove ${leaderName} as Leader from this Fera'a?`)) {
            router.delete(route('feraas.remove-leader', [feraaId, leaderId]));
        }
    };

    // 4. Bulk Import Scouters Modal State
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [importFeraaId, setImportFeraaId] = useState(null);
    const {
        data: importData,
        setData: setImportData,
        post: postImport,
        processing: importProcessing,
        reset: resetImport,
    } = useForm({
        file: null,
        section_id: section.id,
        feraa_id: '',
    });

    const openImportModal = (feraaId) => {
        setImportFeraaId(feraaId);
        setImportData({ ...importData, feraa_id: feraaId });
        setImportModalOpen(true);
    };

    const handleImportSubmit = (e) => {
        e.preventDefault();
        postImport(route('users.import'), {
            onSuccess: () => {
                setImportModalOpen(false);
                resetImport();
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={`${section.name} Section Management`}
            actionButton={
                canManageSection && (
                    <Button variant="primary" size="md" onClick={() => setCreateFeraaOpen(true)}>
                        <PlusIcon className="h-4 w-4 mr-1.5" />
                        Add Fera'a
                    </Button>
                )
            }
        >
            <Head title={`${section.name} Section`} />

            <div className="space-y-6 max-w-6xl mx-auto">
                {/* 1. Dedicated Section Supervisors Management Panel */}
                <Card padding="p-6" className="bg-gradient-to-r from-purple-50 via-white to-purple-50/40 border-purple-200 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-purple-100">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-2xl bg-[#6B21A8] text-white flex items-center justify-center shrink-0 shadow-sm">
                                <ShieldCheckIcon className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="flex items-center space-x-2">
                                    <h3 className="text-lg font-black text-slate-900">
                                        Section Supervisors
                                    </h3>
                                    <span className="text-xs font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                                        {supervisors.length} Assigned
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Supervisors oversee lectures, evaluations, syllabus, and leaders in this section. Super Admin and Admins can assign multiple supervisors.
                                </p>
                            </div>
                        </div>

                        {isAdminOrSuper && (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                    supervisorData.user_id = '';
                                    setSupervisorModalOpen(true);
                                }}
                                className="shrink-0"
                            >
                                <UserPlusIcon className="h-4 w-4 mr-1.5" />
                                Add Supervisor
                            </Button>
                        )}
                    </div>

                    {/* Supervisors List / Grid */}
                    <div className="mt-4">
                        {supervisors.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {supervisors.map((sup) => (
                                    <div
                                        key={sup.id}
                                        className="p-3.5 rounded-2xl bg-white border border-purple-100 flex items-center justify-between shadow-2xs hover:border-purple-200 transition-all"
                                    >
                                        <div className="flex items-center space-x-3 min-w-0">
                                            <div className="h-10 w-10 rounded-xl bg-purple-100 text-[#6B21A8] flex items-center justify-center font-black text-sm shrink-0">
                                                {sup.full_name ? sup.full_name[0] : 'S'}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center space-x-1.5">
                                                    <span className="font-extrabold text-xs text-slate-900 truncate">
                                                        {sup.full_name}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] font-mono text-purple-700 font-semibold truncate">
                                                    {sup.scout_id || sup.email}
                                                </div>
                                                {sup.phone && (
                                                    <div className="text-[10px] text-slate-400">
                                                        {sup.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {isAdminOrSuper && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSupervisor(sup.id, sup.full_name)}
                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0 ml-2"
                                                title={`Remove ${sup.full_name} from section supervisors`}
                                            >
                                                <UserMinusIcon className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 rounded-2xl bg-white border border-dashed border-purple-200 text-center">
                                <p className="text-xs text-slate-500 font-medium">
                                    No supervisors assigned to this section yet.
                                </p>
                                {isAdminOrSuper && (
                                    <Button
                                        variant="soft"
                                        size="sm"
                                        onClick={() => {
                                            supervisorData.user_id = '';
                                            setSupervisorModalOpen(true);
                                        }}
                                        className="mt-2.5"
                                    >
                                        <ShieldCheckIcon className="h-4 w-4 mr-1.5" />
                                        Assign First Supervisor
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </Card>

                {/* 2. Fera'as & Leader Assignments Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 flex items-center">
                                <UsersIcon className="h-6 w-6 mr-2 text-scout-800" />
                                Fera'as & Assigned Leaders ({section.feraas?.length || 0})
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Every group contains many Fera'a. Assign leaders from Gawala, Morashahen, or qualified scout leaders.
                            </p>
                        </div>
                    </div>

                    {section.feraas && section.feraas.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {section.feraas.map((feraa) => {
                                const leaders = feraa.user_roles?.filter((r) => r.role === 'leader') || [];
                                const scouters = feraa.user_roles?.filter((r) => r.role === 'scouter') || [];
                                const sectionPrefix = section.slug.substring(0, 3).toUpperCase();
                                const templatePrefix = `${sectionPrefix}-F${feraa.id}`;

                                return (
                                    <Card
                                        key={feraa.id}
                                        padding="p-6"
                                        className="border-purple-100 flex flex-col justify-between bg-white shadow-xs"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between pb-3 border-b border-purple-50">
                                                <div>
                                                    <h4 className="text-lg font-black text-slate-900">{feraa.name}</h4>
                                                    <span className="text-xs text-slate-400 font-mono">
                                                        Fera'a ID: {templatePrefix}
                                                    </span>
                                                </div>
                                                <Badge variant="scouter" size="md">
                                                    {scouters.length} Scouters
                                                </Badge>
                                            </div>

                                            {/* Leaders Assigned to this Fera'a */}
                                            <div className="mt-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-black uppercase tracking-wider text-slate-600">
                                                        Assigned Leaders ({leaders.length})
                                                    </span>

                                                    {/* Assign Leader Button (Admin & Supervisor Authority) */}
                                                    {canManageSection && (
                                                        <button
                                                            type="button"
                                                            onClick={() => openAssignModal(feraa)}
                                                            className="inline-flex items-center text-xs font-bold text-scout-800 hover:text-purple-950 bg-purple-100/80 hover:bg-purple-200 px-3 py-1 rounded-xl transition-all"
                                                        >
                                                            <UserPlusIcon className="h-3.5 w-3.5 mr-1" />
                                                            Assign Leader
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="space-y-1.5 mt-2">
                                                    {leaders.length > 0 ? (
                                                        leaders.map((ldr) => (
                                                            <div
                                                                key={ldr.id}
                                                                className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs"
                                                            >
                                                                <div>
                                                                    <span className="font-extrabold text-amber-950 block">
                                                                        {ldr.user?.full_name}
                                                                    </span>
                                                                    <span className="text-[11px] text-amber-800 font-mono">
                                                                        {ldr.user?.scout_id || ldr.user?.email}
                                                                    </span>
                                                                </div>

                                                                {canManageSection && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleRemoveLeader(
                                                                                feraa.id,
                                                                                ldr.user_id,
                                                                                ldr.user?.full_name
                                                                            )
                                                                        }
                                                                        className="p-1 rounded-lg hover:bg-amber-200 text-amber-800 hover:text-rose-600 transition-colors"
                                                                        title="Remove leader from this Fera'a"
                                                                    >
                                                                        <XMarkIcon className="h-4 w-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-slate-400 text-xs">
                                                            No leader assigned yet. Click "Assign Leader" above.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Fera'a Footer Actions */}
                                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                                            <a
                                                href={route('users.import-template', { prefix: templatePrefix })}
                                                className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-scout-800 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors border border-purple-200"
                                                title="Download Excel template pre-filled with this Fera'a ID prefix"
                                            >
                                                <ArrowDownTrayIcon className="h-3.5 w-3.5 mr-1" />
                                                XLS Template
                                            </a>

                                            {canManageSection && (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => openImportModal(feraa.id)}
                                                >
                                                    <ArrowUpTrayIcon className="h-3.5 w-3.5 mr-1" />
                                                    Upload Scouters
                                                </Button>
                                            )}
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <Card padding="p-12" className="text-center text-slate-400 text-sm">
                            No Fera'as created in {section.name} yet. Click "Add Fera'a" to create the first one.
                        </Card>
                    )}
                </div>
            </div>

            {/* Modal: Assign Section Supervisor */}
            <Modal
                isOpen={supervisorModalOpen}
                onClose={() => setSupervisorModalOpen(false)}
                title={`Assign Supervisor to ${section.name}`}
            >
                <form onSubmit={handleAssignSupervisor} className="space-y-4">
                    <p className="text-xs text-slate-600">
                        Choose a member to be the official Supervisor of the <strong>{section.name}</strong> section.
                        The supervisor oversees all Fera'as, lectures, evaluations, and leader assignments in this section.
                    </p>

                    <Select
                        label="Select Supervisor"
                        value={supervisorData.user_id}
                        onChange={(e) => setSupervisorData('user_id', e.target.value)}
                        required
                    >
                        <option value="">-- Choose Member --</option>
                        {allMembers.map((m) => {
                            const isAlready = supervisors.some((s) => s.id === m.id);
                            return (
                                <option key={m.id} value={m.id} disabled={isAlready}>
                                    {m.full_name} ({m.scout_id || m.email}){isAlready ? ' (Already Supervisor)' : ''}
                                </option>
                            );
                        })}
                    </Select>

                    <div className="flex justify-end space-x-2 pt-2">
                        <Button variant="secondary" onClick={() => setSupervisorModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={supervisorProcessing || !supervisorData.user_id}>
                            {supervisorProcessing ? 'Assigning...' : 'Confirm Supervisor'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Assign Leader to Fera'a */}
            <Modal
                isOpen={assignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                title={`Assign Leader to ${targetFeraa?.name || "Fera'a"}`}
            >
                <form onSubmit={handleAssignLeader} className="space-y-4">
                    <p className="text-xs text-slate-600">
                        Select a member from <strong>Gawala Boys, Gawala Girls, Morshahen Gawala</strong>, or qualified leaders to lead this Fera'a:
                    </p>

                    <Select
                        label="Select Leader"
                        value={assignData.user_id}
                        onChange={(e) => setAssignData('user_id', e.target.value)}
                        required
                    >
                        <option value="">-- Select Eligible Leader --</option>
                        {eligibleLeaders.map((ldr) => (
                            <option key={ldr.id} value={ldr.id}>
                                {ldr.full_name} • [{ldr.source || 'Scouter'}] ({ldr.scout_id || ldr.email})
                            </option>
                        ))}
                    </Select>

                    <div className="flex justify-end space-x-2 pt-2">
                        <Button variant="secondary" onClick={() => setAssignModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={assignProcessing || !assignData.user_id}>
                            {assignProcessing ? 'Assigning...' : 'Assign Leader'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Create Fera'a */}
            <Modal
                isOpen={createFeraaOpen}
                onClose={() => setCreateFeraaOpen(false)}
                title={`Add New Fera'a to ${section.name}`}
            >
                <form onSubmit={handleCreateFeraa} className="space-y-4">
                    <Input
                        label="Fera'a Name"
                        placeholder="e.g. Fera'a 3 (Wolves)"
                        value={feraaData.name}
                        onChange={(e) => setFeraaData('name', e.target.value)}
                        required
                    />

                    <div className="flex justify-end space-x-2 pt-2">
                        <Button variant="secondary" onClick={() => setCreateFeraaOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={feraaProcessing}>
                            {feraaProcessing ? 'Creating...' : 'Create Fera\'a'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Bulk Upload Scouters */}
            <Modal
                isOpen={importModalOpen}
                onClose={() => setImportModalOpen(false)}
                title="Bulk Upload Scouters (Excel / CSV)"
            >
                <form onSubmit={handleImportSubmit} className="space-y-4">
                    <p className="text-xs text-slate-500">
                        Upload the completed spreadsheet for this Fera'a. Scouters will be automatically registered and attached to this Fera'a.
                    </p>

                    <div className="p-4 border-2 border-dashed border-purple-200 rounded-2xl bg-purple-50/50 text-center">
                        <input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={(e) => setImportData('file', e.target.files[0])}
                            required
                            className="text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-scout-800 file:text-white hover:file:bg-scout-900 cursor-pointer"
                        />
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                        <Button variant="secondary" onClick={() => setImportModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="success" disabled={importProcessing || !importData.file}>
                            {importProcessing ? 'Uploading...' : 'Upload Scouters'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
