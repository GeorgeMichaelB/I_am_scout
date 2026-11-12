import React, { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import Card from '../../Components/Card';
import Button from '../../Components/Button';
import Badge from '../../Components/Badge';
import Modal from '../../Components/Modal';
import Select from '../../Components/Select';
import Input from '../../Components/Input';
import Pagination from '../../Components/Pagination';
import {
    ShieldCheckIcon,
    PlusIcon,
    TrashIcon,
    UserPlusIcon,
    ArrowUpCircleIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';

export default function RolesIndex({ users, sections = [], filters = {} }) {
    const { auth } = usePage().props;
    const currentUser = auth?.user;

    const [search, setSearch] = useState(filters.search || '');
    const [selectedRoleFilter, setSelectedRoleFilter] = useState(filters.role || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('roles.index'),
            {
                search: search || undefined,
                role: selectedRoleFilter || undefined,
            },
            { preserveState: true }
        );
    };

    // 1. Upgrade / Downgrade Modal State
    const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
    const [targetUser, setTargetUser] = useState(null);

    const {
        data: rankData,
        setData: setRankData,
        post: postRank,
        processing: rankProcessing,
        reset: resetRank,
    } = useForm({
        role: 'scouter',
        section_id: '',
        feraa_id: '',
        action: 'replace_all', // 'replace_all' for rank change, 'add' for secondary role
    });

    const openUpgradeModal = (u) => {
        setTargetUser(u);
        const highest = u.roles?.[0]?.role || 'scouter';
        setRankData({
            role: highest,
            section_id: u.roles?.[0]?.section_id || '',
            feraa_id: u.roles?.[0]?.feraa_id || '',
            action: 'replace_all',
        });
        setUpgradeModalOpen(true);
    };

    const handleUpgradeSubmit = (e) => {
        e.preventDefault();
        if (!targetUser) return;

        postRank(route('roles.upgrade-downgrade', targetUser.id), {
            onSuccess: () => {
                setUpgradeModalOpen(false);
                resetRank();
            },
        });
    };

    // 2. Add Secondary Team Role Modal State
    const [addRoleModalOpen, setAddRoleModalOpen] = useState(false);
    const {
        data: addRoleData,
        setData: setAddRoleData,
        post: postAddRole,
        processing: addRoleProcessing,
        reset: resetAddRole,
    } = useForm({
        user_id: '',
        role: 'scouter',
        section_id: '',
        feraa_id: '',
    });

    const openAddRoleForUser = (u) => {
        setTargetUser(u);
        setAddRoleData({
            user_id: u.id,
            role: 'leader',
            section_id: '',
            feraa_id: '',
        });
        setAddRoleModalOpen(true);
    };

    const handleAddRoleSubmit = (e) => {
        e.preventDefault();
        postAddRole(route('roles.store'), {
            onSuccess: () => {
                setAddRoleModalOpen(false);
                resetAddRole();
            },
        });
    };

    const handleRemoveRole = (userRoleId, roleName, userName) => {
        if (confirm(`Remove the '${roleName}' role from ${userName}?`)) {
            router.delete(route('roles.destroy', userRoleId));
        }
    };

    const selectedSecForRank = sections.find((s) => s.id === parseInt(rankData.section_id));
    const availableFeraasForRank = selectedSecForRank?.feraas || [];

    const selectedSecForAdd = sections.find((s) => s.id === parseInt(addRoleData.section_id));
    const availableFeraasForAdd = selectedSecForAdd?.feraas || [];

    return (
        <AuthenticatedLayout header="Role & Authority Management">
            <Head title="Role Authority Center" />

            <div className="space-y-6 max-w-6xl mx-auto">
                {/* Banner */}
                <Card padding="p-6" className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-start space-x-3.5">
                            <ShieldCheckIcon className="h-9 w-9 text-purple-300 shrink-0 mt-0.5" />
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-purple-300">
                                    Super Admin Control Center
                                </span>
                                <h3 className="text-xl font-black mt-0.5">Account Roles, Upgrades & Cross-Team Teams</h3>
                                <p className="text-xs text-purple-200/90 mt-1 max-w-2xl leading-relaxed">
                                    Control every account in the scout group. Upgrade or downgrade accounts, assign section supervisors, or assign members as leaders in one section while they remain scouters in another team (e.g. Gawala).
                                </p>
                            </div>
                        </div>

                        <div className="shrink-0">
                            <Button
                                variant="soft"
                                size="sm"
                                onClick={() => {
                                    setTargetUser(null);
                                    setAddRoleData({ user_id: '', role: 'leader', section_id: '', feraa_id: '' });
                                    setAddRoleModalOpen(true);
                                }}
                            >
                                <UserPlusIcon className="h-4 w-4 mr-1.5" />
                                Assign Role to Member
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Search & Filter */}
                <Card padding="p-4" className="border-purple-100">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                            <Input
                                placeholder="Search by name, scout ID, email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div>
                            <Select
                                value={selectedRoleFilter}
                                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                            >
                                <option value="">All Roles</option>
                                <option value="super_admin">Super Admin</option>
                                <option value="admin">Admin</option>
                                <option value="supervisor">Supervisor</option>
                                <option value="leader">Leader</option>
                                <option value="scouter">Scouter</option>
                                <option value="dev">Dev</option>
                            </Select>
                        </div>

                        <div>
                            <Button type="submit" variant="primary" size="md" className="w-full">
                                <MagnifyingGlassIcon className="h-4 w-4 mr-1.5" />
                                Filter Accounts
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Accounts Table */}
                <Card padding="p-0" className="overflow-hidden border-purple-100 bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#FAF7FC] text-slate-500 uppercase tracking-wider font-extrabold text-[10px] border-b border-purple-100">
                                <tr>
                                    <th className="py-3.5 px-4">Scout ID</th>
                                    <th className="py-3.5 px-4">Full Name</th>
                                    <th className="py-3.5 px-4">Email</th>
                                    <th className="py-3.5 px-4">Current Team Roles & Assignments</th>
                                    <th className="py-3.5 px-4 text-right">Super Admin Authority</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-purple-50">
                                {users.data && users.data.length > 0 ? (
                                    users.data.map((u) => (
                                        <tr key={u.id} className="hover:bg-purple-50/40 transition-colors">
                                            <td className="py-3.5 px-4 font-mono font-bold text-scout-800">
                                                {u.scout_id || 'ID Pending'}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="font-extrabold text-slate-900 text-sm">{u.full_name}</div>
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-500">{u.email}</td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex flex-wrap gap-1.5 items-center">
                                                    {u.roles?.length > 0 ? (
                                                        u.roles.map((r) => (
                                                            <span
                                                                key={r.id}
                                                                className="inline-flex items-center space-x-1 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-semibold bg-purple-50 border border-purple-200 text-scout-900 shadow-2xs"
                                                            >
                                                                <span className="font-bold uppercase text-[10px] text-purple-700">
                                                                    {r.role}
                                                                </span>
                                                                {r.section && (
                                                                    <span className="text-slate-600">
                                                                        • {r.section.name}
                                                                    </span>
                                                                )}
                                                                {r.feraa && (
                                                                    <span className="text-slate-500">
                                                                        [{r.feraa.name}]
                                                                    </span>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveRole(r.id, r.role, u.full_name)}
                                                                    className="hover:bg-purple-200 text-purple-700 hover:text-rose-600 rounded-full p-0.5 ml-1 transition-colors"
                                                                    title="Revoke this role"
                                                                >
                                                                    <XMarkIcon className="h-3 w-3" />
                                                                </button>
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-slate-400 italic">No roles</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                                                {/* Upgrade / Downgrade Action */}
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => openUpgradeModal(u)}
                                                >
                                                    <ArrowUpCircleIcon className="h-4 w-4 mr-1" />
                                                    Upgrade / Rank
                                                </Button>

                                                {/* Add Secondary Team Role Action */}
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => openAddRoleForUser(u)}
                                                    title="Assign a second role in another team"
                                                >
                                                    <PlusIcon className="h-3.5 w-3.5 mr-1" />
                                                    + Team Role
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-slate-400">
                                            No users found matching the query.
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

            {/* Modal: Upgrade / Downgrade Account */}
            <Modal
                isOpen={upgradeModalOpen}
                onClose={() => setUpgradeModalOpen(false)}
                title={`Upgrade / Downgrade Rank for ${targetUser?.full_name || 'Member'}`}
            >
                <form onSubmit={handleUpgradeSubmit} className="space-y-4">
                    <p className="text-xs text-slate-600">
                        Super Admin can change this member's primary authority level or grant them specific leadership permissions:
                    </p>

                    <Select
                        label="New Rank / Authority"
                        value={rankData.role}
                        onChange={(e) => setRankData('role', e.target.value)}
                        required
                    >
                        <option value="scouter">Scouter (Basic Scout - Calendar, Syllabus, Chat)</option>
                        <option value="leader">Leader (Attendance, Evaluations, Ta7der, View Scouters)</option>
                        <option value="supervisor">Supervisor (Section Syllabus, View Evaluations, Assign Leaders)</option>
                        <option value="admin">Admin (All Sections, Create/Delete Accounts, General Directives, Schedule)</option>
                        <option value="super_admin">Super Admin (All Admin Powers + Role Upgrades/Downgrades)</option>
                        <option value="dev">Dev (Unrestricted Full Access)</option>
                    </Select>

                    {/* Section Assignment if Supervisor or Leader or Scouter */}
                    {['supervisor', 'leader', 'scouter'].includes(rankData.role) && (
                        <Select
                            label="Assigned Section"
                            value={rankData.section_id}
                            onChange={(e) => setRankData({ ...rankData, section_id: e.target.value, feraa_id: '' })}
                            required
                        >
                            <option value="">-- Choose Section --</option>
                            {sections.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </Select>
                    )}

                    {/* Fera'a Assignment if Leader or Scouter */}
                    {['leader', 'scouter'].includes(rankData.role) && rankData.section_id && (
                        <Select
                            label="Assigned Fera'a"
                            value={rankData.feraa_id}
                            onChange={(e) => setRankData('feraa_id', e.target.value)}
                            required
                        >
                            <option value="">-- Choose Fera'a --</option>
                            {availableFeraasForRank.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.name}
                                </option>
                            ))}
                        </Select>
                    )}

                    <div className="pt-2">
                        <label className="block text-xs font-semibold tracking-wide uppercase text-slate-600 mb-1.5">
                            Authority Scope Action
                        </label>
                        <div className="space-y-2 text-xs">
                            <label className="flex items-center space-x-2 p-2.5 rounded-xl border border-purple-200 bg-purple-50/50 cursor-pointer">
                                <input
                                    type="radio"
                                    name="action"
                                    value="replace_all"
                                    checked={rankData.action === 'replace_all'}
                                    onChange={(e) => setRankData('action', e.target.value)}
                                    className="text-purple-600 focus:ring-purple-500"
                                />
                                <div>
                                    <span className="font-bold text-slate-900 block">Replace Primary Rank</span>
                                    <span className="text-slate-500 text-[11px]">Set as their main role across the system</span>
                                </div>
                            </label>

                            <label className="flex items-center space-x-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                                <input
                                    type="radio"
                                    name="action"
                                    value="add"
                                    checked={rankData.action === 'add'}
                                    onChange={(e) => setRankData('action', e.target.value)}
                                    className="text-purple-600 focus:ring-purple-500"
                                />
                                <div>
                                    <span className="font-bold text-slate-900 block">Add as Secondary Role</span>
                                    <span className="text-slate-500 text-[11px]">Keep existing roles and add this new team role</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                        <Button variant="secondary" onClick={() => setUpgradeModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={rankProcessing}>
                            {rankProcessing ? 'Updating...' : 'Update Account Rank'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Add Secondary Team Role */}
            <Modal
                isOpen={addRoleModalOpen}
                onClose={() => setAddRoleModalOpen(false)}
                title="Assign Additional Role to Team"
            >
                <form onSubmit={handleAddRoleSubmit} className="space-y-4">
                    <p className="text-xs text-slate-600">
                        Assign an additional role to a member (e.g. a leader in Ashbal who is also a scouter in Gawala Boys):
                    </p>

                    <Select
                        label="Member"
                        value={addRoleData.user_id}
                        onChange={(e) => setAddRoleData('user_id', e.target.value)}
                        required
                    >
                        <option value="">-- Choose Member --</option>
                        {users.data?.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.full_name} ({m.scout_id || m.email})
                            </option>
                        ))}
                    </Select>

                    <Select
                        label="Role"
                        value={addRoleData.role}
                        onChange={(e) => setAddRoleData('role', e.target.value)}
                        required
                    >
                        <option value="leader">Leader</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="scouter">Scouter</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                    </Select>

                    <Select
                        label="Section"
                        value={addRoleData.section_id}
                        onChange={(e) => setAddRoleData({ ...addRoleData, section_id: e.target.value, feraa_id: '' })}
                    >
                        <option value="">-- Choose Section (Optional for Admin) --</option>
                        {sections.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </Select>

                    {addRoleData.section_id && (
                        <Select
                            label="Fera'a"
                            value={addRoleData.feraa_id}
                            onChange={(e) => setAddRoleData('feraa_id', e.target.value)}
                        >
                            <option value="">-- Choose Fera'a (Optional) --</option>
                            {availableFeraasForAdd.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.name}
                                </option>
                            ))}
                        </Select>
                    )}

                    <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                        <Button variant="secondary" onClick={() => setAddRoleModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={addRoleProcessing}>
                            {addRoleProcessing ? 'Assigning...' : 'Assign Role'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
