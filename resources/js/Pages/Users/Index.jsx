import React, { useState } from 'react';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import Card from '../../Components/Card';
import Button from '../../Components/Button';
import Badge from '../../Components/Badge';
import Input from '../../Components/Input';
import Select from '../../Components/Select';
import Pagination from '../../Components/Pagination';
import Modal from '../../Components/Modal';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    ArrowDownTrayIcon,
    ArrowUpTrayIcon,
    EyeIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';

export default function UsersIndex({ users, sections = [], filters = {} }) {
    const { auth } = usePage().props;
    const currentUser = auth?.user;
    const highestRole = currentUser?.highestRole || currentUser?.highest_role || 'scouter';

    const canCreateOrDelete = ['dev', 'super_admin', 'admin'].includes(highestRole);

    const [search, setSearch] = useState(filters.search || '');
    const [selectedSection, setSelectedSection] = useState(filters.section_id || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(
            route('users.index'),
            {
                search: search || undefined,
                section_id: selectedSection || undefined,
                role: selectedRole || undefined,
            },
            { preserveState: true }
        );
    };

    // Bulk Import Modal
    const [importOpen, setImportOpen] = useState(false);
    const { data: importData, setData: setImportData, post: postImport, processing: importProcessing, reset: resetImport } = useForm({
        file: null,
        section_id: '',
        feraa_id: '',
    });

    const handleImportSubmit = (e) => {
        e.preventDefault();
        postImport(route('users.import'), {
            onSuccess: () => {
                setImportOpen(false);
                resetImport();
            },
        });
    };

    const handleDeleteUser = (userId, name) => {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            router.delete(route('users.destroy', userId));
        }
    };

    return (
        <AuthenticatedLayout
            header="Scouter Directory"
            actionButton={
                <div className="flex flex-wrap items-center gap-2">
                    <a
                        href={route('users.import-template')}
                        className="inline-flex items-center px-3 py-2 text-xs font-bold text-scout-800 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors border border-purple-200"
                        title="Download blank Excel spreadsheet template"
                    >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1.5" />
                        XLS Template
                    </a>

                    <Button variant="secondary" size="md" onClick={() => setImportOpen(true)}>
                        <ArrowUpTrayIcon className="h-4 w-4 mr-1.5" />
                        Import XLS
                    </Button>

                    {canCreateOrDelete && (
                        <Link href={route('users.create')}>
                            <Button variant="primary" size="md">
                                <PlusIcon className="h-4 w-4 mr-1.5" />
                                Add Member
                            </Button>
                        </Link>
                    )}
                </div>
            }
        >
            <Head title="Scouter Directory" />

            <div className="space-y-5">
                {/* Search & Filters */}
                <Card padding="p-4" className="border-purple-100">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                            <Input
                                placeholder="Search by Scout ID (e.g. ASH-F1-001), Name, Email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div>
                            <Select
                                value={selectedSection}
                                onChange={(e) => setSelectedSection(e.target.value)}
                                placeholder="All Sections"
                            >
                                <option value="">All Sections</option>
                                {sections.map((sec) => (
                                    <option key={sec.id} value={sec.id}>
                                        {sec.name}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div className="flex space-x-2">
                            <Select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                placeholder="All Roles"
                            >
                                <option value="">All Roles</option>
                                <option value="scouter">Scouter</option>
                                <option value="leader">Leader</option>
                                <option value="supervisor">Supervisor</option>
                                <option value="admin">Admin</option>
                                <option value="super_admin">Super Admin</option>
                                <option value="dev">Dev</option>
                            </Select>

                            <Button type="submit" variant="primary" size="md">
                                <MagnifyingGlassIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Scouters Table */}
                <Card padding="p-0" className="overflow-hidden border-purple-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#FAF7FC] text-slate-500 uppercase tracking-wider font-extrabold text-[10px] border-b border-purple-100">
                                <tr>
                                    <th className="py-3.5 px-4">Scout ID</th>
                                    <th className="py-3.5 px-4">Full Name</th>
                                    <th className="py-3.5 px-4">Roles & Teams</th>
                                    <th className="py-3.5 px-4">School & Grade</th>
                                    <th className="py-3.5 px-4">Contacts</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-purple-50">
                                {users.data && users.data.length > 0 ? (
                                    users.data.map((u) => (
                                        <tr key={u.id} className="hover:bg-purple-50/40 transition-colors">
                                            <td className="py-3 px-4 font-mono font-bold text-scout-800">
                                                {u.scout_id || 'ID Pending'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="font-bold text-slate-900 text-sm">{u.full_name}</div>
                                                <div className="text-slate-400 text-[11px]">{u.email}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {u.roles?.map((r) => (
                                                        <Badge key={r.id} variant={r.role} size="sm">
                                                            {r.role} {r.section ? `(${r.section.name})` : ''}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-slate-600">
                                                <div>{u.school || '—'}</div>
                                                <div className="text-slate-400 text-[11px]">{u.grade || ''}</div>
                                            </td>
                                            <td className="py-3 px-4 text-slate-600">
                                                <div>{u.phone || '—'}</div>
                                                {u.mom_phone && (
                                                    <div className="text-[10px] text-slate-400">Mom: {u.mom_phone}</div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                                                <Link href={route('users.show', u.id)}>
                                                    <button className="p-1.5 rounded-lg text-scout-700 hover:bg-purple-100 transition-colors" title="View & Edit Profile">
                                                        <EyeIcon className="h-4 w-4" />
                                                    </button>
                                                </Link>

                                                {canCreateOrDelete && u.id !== currentUser.id && (
                                                    <button
                                                        onClick={() => handleDeleteUser(u.id, u.full_name)}
                                                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 transition-colors"
                                                        title="Delete Account"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-slate-400">
                                            No scouters found matching the criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t border-purple-50">
                        <Pagination links={users.links} />
                    </div>
                </Card>
            </div>

            {/* Modal: Bulk XLS Import */}
            <Modal
                isOpen={importOpen}
                onClose={() => setImportOpen(false)}
                title="Bulk Upload Scouters (Excel / CSV)"
            >
                <form onSubmit={handleImportSubmit} className="space-y-4">
                    <p className="text-xs text-slate-500">
                        Download the template first if you haven't yet, fill it with your scouters data, then select the target Section and upload:
                    </p>

                    <Select
                        label="Assign to Section"
                        value={importData.section_id}
                        onChange={(e) => setImportData('section_id', e.target.value)}
                    >
                        <option value="">Select Section (Optional)</option>
                        {sections.map((sec) => (
                            <option key={sec.id} value={sec.id}>
                                {sec.name}
                            </option>
                        ))}
                    </Select>

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
                        <Button variant="secondary" onClick={() => setImportOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="success" disabled={importProcessing || !importData.file}>
                            {importProcessing ? 'Processing File...' : 'Upload & Import'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}

