import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
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
} from '@heroicons/react/24/outline';

export default function EvaluationsIndex({ evaluations, feraas = [] }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const highestRole = user?.highestRole || 'scouter';

    const canCreate = ['dev', 'super_admin', 'admin', 'supervisor', 'leader'].includes(highestRole);

    const [modalOpen, setModalOpen] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        feraa_id: feraas[0]?.id || '',
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

    return (
        <AuthenticatedLayout
            header="Weekly Evaluations & Attendance"
            actionButton={
                canCreate && (
                    <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
                        <PlusIcon className="h-4 w-4 mr-1.5" />
                        New Evaluation Sheet
                    </Button>
                )
            }
        >
            <Head title="Weekly Evaluations" />

            <div className="space-y-6">
                <p className="text-sm text-slate-500">
                    Track weekly discipline: Hair, Trousers, Clothes, Scout Rope, and Missed Lectures.
                    Toggling activation determines whether scores count for the scouter's cumulative record.
                </p>

                {/* Evaluations Table */}
                <Card padding="p-0" className="overflow-hidden border-purple-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#FAF7FC] text-slate-500 uppercase tracking-wider font-extrabold text-[10px] border-b border-purple-100">
                                <tr>
                                    <th className="py-3.5 px-4">Week Date</th>
                                    <th className="py-3.5 px-4">Fera'a / Section</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4">Entries Count</th>
                                    <th className="py-3.5 px-4">Leader in Charge</th>
                                    <th className="py-3.5 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-purple-50">
                                {evaluations.data && evaluations.data.length > 0 ? (
                                    evaluations.data.map((ev) => (
                                        <tr key={ev.id} className="hover:bg-purple-50/40 transition-colors">
                                            <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                                                {ev.week_date}
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
                                                    {ev.is_active ? 'Activated (Counted)' : 'Not Counted'}
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
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-slate-400">
                                            No weekly evaluation sheets recorded yet.
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
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Weekly Evaluation Sheet">
                <form onSubmit={handleCreate} className="space-y-4">
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
                        label="Week Date"
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
                            Activate evaluation for this week (counted for scouters)
                        </label>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
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
