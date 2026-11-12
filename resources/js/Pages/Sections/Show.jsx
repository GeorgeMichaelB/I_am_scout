import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
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
} from '@heroicons/react/24/outline';

export default function SectionsShow({ section, availableLeaders = [] }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const highestRole = user?.highestRole || 'scouter';

    const canManage = ['dev', 'super_admin', 'admin', 'supervisor'].includes(highestRole);

    // Create Fera'a modal state
    const [createFeraaOpen, setCreateFeraaOpen] = useState(false);
    const { data: feraaData, setData: setFeraaData, post: postFeraa, processing: feraaProcessing, reset: resetFeraa } = useForm({
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

    // Assign Leader modal state
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [targetFeraaId, setTargetFeraaId] = useState(null);
    const { data: assignData, setData: setAssignData, post: postAssign, processing: assignProcessing, reset: resetAssign } = useForm({
        user_id: '',
    });

    const openAssignModal = (feraaId) => {
        setTargetFeraaId(feraaId);
        setAssignModalOpen(true);
    };

    const handleAssignLeader = (e) => {
        e.preventDefault();
        postAssign(route('feraas.assign-leader', targetFeraaId), {
            onSuccess: () => {
                setAssignModalOpen(false);
                resetAssign();
            },
        });
    };

    // Import scouters modal
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [importFeraaId, setImportFeraaId] = useState(null);
    const { data: importData, setData: setImportData, post: postImport, processing: importProcessing, reset: resetImport } = useForm({
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

    const supervisor = section.user_roles?.find((r) => r.role === 'supervisor')?.user;

    return (
        <AuthenticatedLayout
            header={`${section.name} Section`}
            actionButton={
                canManage && (
                    <Button variant="primary" size="md" onClick={() => setCreateFeraaOpen(true)}>
                        <PlusIcon className="h-4 w-4 mr-1.5" />
                        Add Fera'a
                    </Button>
                )
            }
        >
            <Head title={section.name} />

            <div className="space-y-6">
                {/* Supervisor Banner */}
                <Card padding="p-5" className="bg-gradient-to-r from-purple-50 to-white border-purple-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-2xl bg-purple-700 text-white flex items-center justify-center font-bold text-sm">
                                {supervisor?.full_name ? supervisor.full_name[0] : 'S'}
                            </div>
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-scout-600 block">
                                    Section Supervisor
                                </span>
                                <span className="text-base font-extrabold text-slate-800">
                                    {supervisor?.full_name || 'No Supervisor Assigned Yet'}
                                </span>
                            </div>
                        </div>

                        {supervisor?.scout_id && (
                            <span className="text-xs font-mono font-bold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                                ID: {supervisor.scout_id}
                            </span>
                        )}
                    </div>
                </Card>

                {/* Fera'a List */}
                <div className="space-y-4">
                    <h3 className="text-lg font-black text-slate-900 flex items-center">
                        <UsersIcon className="h-5 w-5 mr-2 text-scout-800" />
                        Fera'as ({section.feraas?.length || 0})
                    </h3>

                    {section.feraas && section.feraas.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {section.feraas.map((feraa) => {
                                const leaders = feraa.user_roles?.filter((r) => r.role === 'leader') || [];
                                const scouters = feraa.user_roles?.filter((r) => r.role === 'scouter') || [];
                                const sectionPrefix = section.slug.substring(0, 3).toUpperCase();
                                const templatePrefix = `${sectionPrefix}-F${feraa.id}`;

                                return (
                                    <Card key={feraa.id} padding="p-6" className="border-purple-100 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-lg font-bold text-slate-900">{feraa.name}</h4>
                                                <Badge variant="feraa" size="sm">
                                                    ID: F{feraa.id}
                                                </Badge>
                                            </div>

                                            {/* Leaders Section */}
                                            <div className="mt-3">
                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                                                    Assigned Leaders ({leaders.length})
                                                </span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {leaders.length > 0 ? (
                                                        leaders.map((ldr) => (
                                                            <span
                                                                key={ldr.id}
                                                                className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200"
                                                            >
                                                                {ldr.user?.full_name}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">No leader assigned</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Scouters Count */}
                                            <div className="mt-4 text-xs font-semibold text-slate-600">
                                                <span>Active Scouters: </span>
                                                <span className="font-bold text-scout-800 text-sm">{scouters.length}</span>
                                            </div>
                                        </div>

                                        {/* Action Bar */}
                                        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                                            {canManage && (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => openAssignModal(feraa.id)}
                                                >
                                                    <UserPlusIcon className="h-3.5 w-3.5 mr-1" />
                                                    Assign Leader
                                                </Button>
                                            )}

                                            <div className="flex items-center space-x-1.5 ml-auto">
                                                <a
                                                    href={route('users.import-template', { prefix: templatePrefix })}
                                                    className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold text-scout-800 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors border border-purple-200"
                                                    title="Download XLS Template pre-filled with this Fera'a ID prefix"
                                                >
                                                    <ArrowDownTrayIcon className="h-3.5 w-3.5 mr-1" />
                                                    XLS Template
                                                </a>

                                                {canManage && (
                                                    <button
                                                        onClick={() => openImportModal(feraa.id)}
                                                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200"
                                                    >
                                                        <ArrowUpTrayIcon className="h-3.5 w-3.5 mr-1" />
                                                        Import
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <Card padding="p-8" className="text-center text-slate-400 text-sm">
                            No Fera'as created yet in this section.
                        </Card>
                    )}
                </div>
            </div>

            {/* Modal: Create Fera'a */}
            <Modal
                isOpen={createFeraaOpen}
                onClose={() => setCreateFeraaOpen(false)}
                title={`Add Fera'a to ${section.name}`}
            >
                <form onSubmit={handleCreateFeraa} className="space-y-4">
                    <Input
                        label="Fera'a Name"
                        placeholder="e.g. Fera'a 1 (Eagles)"
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

            {/* Modal: Assign Leader */}
            <Modal
                isOpen={assignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                title="Assign Leader to Fera'a"
            >
                <form onSubmit={handleAssignLeader} className="space-y-4">
                    <p className="text-xs text-slate-500 mb-2">
                        Select a member from Gawala, Morashahen, or qualified leaders:
                    </p>

                    <Select
                        label="Select Leader"
                        value={assignData.user_id}
                        onChange={(e) => setAssignData('user_id', e.target.value)}
                        required
                    >
                        <option value="">-- Choose Leader --</option>
                        {availableLeaders.map((ldr) => (
                            <option key={ldr.id} value={ldr.id}>
                                {ldr.full_name} ({ldr.scout_id || ldr.email})
                            </option>
                        ))}
                    </Select>

                    <div className="flex justify-end space-x-2 pt-2">
                        <Button variant="secondary" onClick={() => setAssignModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={assignProcessing}>
                            {assignProcessing ? 'Assigning...' : 'Assign as Leader'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Bulk Import Scouters */}
            <Modal
                isOpen={importModalOpen}
                onClose={() => setImportModalOpen(false)}
                title="Bulk Upload Scouters (XLS/CSV)"
            >
                <form onSubmit={handleImportSubmit} className="space-y-4">
                    <p className="text-xs text-slate-500">
                        Upload the completed spreadsheet. Scouters will be automatically registered and attached to this Fera'a.
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
                            {importProcessing ? 'Uploading & Importing...' : 'Upload & Import'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
