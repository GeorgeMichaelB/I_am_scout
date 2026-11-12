import React, { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import Card from '../../Components/Card';
import Button from '../../Components/Button';
import Badge from '../../Components/Badge';
import Modal from '../../Components/Modal';
import Select from '../../Components/Select';
import Pagination from '../../Components/Pagination';
import {
    ShieldCheckIcon,
    PlusIcon,
    TrashIcon,
    UserPlusIcon,
} from '@heroicons/react/24/outline';

export default function RolesIndex({ users, sections = [] }) {
    const { auth } = usePage().props;
    const currentUser = auth?.user;

    const [modalOpen, setModalOpen] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        user_id: '',
        role: 'scouter',
        section_id: '',
        feraa_id: '',
    });

    const selectedSec = sections.find((s) => s.id === parseInt(data.section_id));
    const availableFeraas = selectedSec?.feraas || [];

    const handleAssignRole = (e) => {
        e.preventDefault();
        post(route('roles.store'), {
            onSuccess: () => {
                setModalOpen(false);
                reset();
            },
        });
    };

    const handleRemoveRole = (userRoleId) => {
        if (confirm('Are you sure you want to remove this role from this member?')) {
            router.delete(route('roles.destroy', userRoleId));
        }
    };

    const openForUser = (userId) => {
        setData({
            user_id: userId,
            role: 'scouter',
            section_id: '',
            feraa_id: '',
        });
        setModalOpen(true);
    };

    return (
        <AuthenticatedLayout
            header="Roles & Team Permissions"
            actionButton={
                <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
                    <UserPlusIcon className="h-4 w-4 mr-1.5" />
                    Assign Additional Role
                </Button>
            }
        >
            <Head title="Roles Management" />

            <div className="space-y-6">
                <Card padding="p-5" className="bg-gradient-to-r from-purple-900 to-purple-800 text-white shadow-md">
                    <div className="flex items-center space-x-3">
                        <ShieldCheckIcon className="h-8 w-8 text-purple-300 shrink-0" />
                        <div>
                            <h3 className="text-base font-black">Super Admin Authority</h3>
                            <p className="text-xs text-purple-200 mt-0.5">
                                A person can hold multiple roles across teams (e.g., Leader in Ashbal and Scouter in Gawala).
                                Upgrade or downgrade accounts at will.
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Table */}
                <Card padding="p-0" className="overflow-hidden border-purple-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#FAF7FC] text-slate-500 uppercase tracking-wider font-extrabold text-[10px] border-b border-purple-100">
                                <tr>
                                    <th className="py-3.5 px-4">Scout ID</th>
                                    <th className="py-3.5 px-4">Member Name</th>
                                    <th className="py-3.5 px-4">Email</th>
                                    <th className="py-3.5 px-4">Active Assigned Roles & Teams</th>
                                    <th className="py-3.5 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-purple-50">
                                {users.data && users.data.length > 0 ? (
                                    users.data.map((u) => (
                                        <tr key={u.id} className="hover:bg-purple-50/30 transition-colors">
                                            <td className="py-3 px-4 font-mono font-bold text-scout-800">
                                                {u.scout_id || 'ID Pending'}
                                            </td>
                                            <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                                                {u.full_name}
                                            </td>
                                            <td className="py-3 px-4 text-slate-500">{u.email}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex flex-wrap gap-1.5 items-center">
                                                    {u.roles?.map((r) => (
                                                        <span
                                                            key={r.id}
                                                            className="inline-flex items-center space-x-1 pl-2.5 pr-1.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 border border-purple-200 text-scout-900"
                                                        >
                                                            <span>
                                                                {r.role}
                                                                {r.section ? ` (${r.section.name})` : ''}
                                                                {r.feraa ? ` [${r.feraa.name}]` : ''}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveRole(r.id)}
                                                                className="hover:bg-purple-200 text-purple-700 hover:text-rose-600 rounded-full p-0.5 ml-1 transition-colors"
                                                                title="Remove this role"
                                                            >
                                                                <TrashIcon className="h-3 w-3" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => openForUser(u.id)}
                                                >
                                                    <PlusIcon className="h-3.5 w-3.5 mr-1" />
                                                    Add Role
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-slate-400">
                                            No users found.
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

            {/* Modal: Assign Role */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Assign Role to Account">
                <form onSubmit={handleAssignRole} className="space-y-4">
                    <Select
                        label="Member"
                        value={data.user_id}
                        onChange={(e) => setData('user_id', e.target.value)}
                        required
                    >
                        <option value="">Select Member</option>
                        {users.data?.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.full_name} ({u.scout_id || u.email})
                            </option>
                        ))}
                    </Select>

                    <Select
                        label="Role Permission"
                        value={data.role}
                        onChange={(e) => setData('role', e.target.value)}
                        required
                    >
                        <option value="scouter">Scouter</option>
                        <option value="leader">Leader</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="dev">Dev</option>
                    </Select>

                    <Select
                        label="Scout Section"
                        value={data.section_id}
                        onChange={(e) => setData('section_id', e.target.value)}
                    >
                        <option value="">None / General Authority</option>
                        {sections.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </Select>

                    <Select
                        label="Fera'a"
                        value={data.feraa_id}
                        onChange={(e) => setData('feraa_id', e.target.value)}
                        disabled={!data.section_id}
                    >
                        <option value="">All Fera'as / None</option>
                        {availableFeraas.map((f) => (
                            <option key={f.id} value={f.id}>
                                {f.name}
                            </option>
                        ))}
                    </Select>

                    <div className="flex justify-end space-x-2 pt-2">
                        <Button variant="secondary" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={processing}>
                            {processing ? 'Assigning...' : 'Assign Role'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}

