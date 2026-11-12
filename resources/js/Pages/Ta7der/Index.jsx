import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
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
    DocumentTextIcon,
    CheckCircleIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';

export default function Ta7derIndex({ ta7ders, myFeraas = [] }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const highestRole = user?.highestRole || 'scouter';

    const canSubmit = ['dev', 'super_admin', 'admin', 'supervisor', 'leader'].includes(highestRole);

    const [modalOpen, setModalOpen] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        feraa_id: myFeraas[0]?.id || '',
        week_date: new Date().toISOString().split('T')[0],
        content: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('ta7der.store'), {
            onSuccess: () => {
                setModalOpen(false);
                reset();
            },
        });
    };

    return (
        <AuthenticatedLayout
            header="Leader Weekly Ta7der (Preparation)"
            actionButton={
                canSubmit && (
                    <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
                        <PlusIcon className="h-4 w-4 mr-1.5" />
                        Submit New Ta7der
                    </Button>
                )
            }
        >
            <Head title="Leader Ta7der" />

            <div className="space-y-6">
                <p className="text-sm text-slate-500">
                    Submit your weekly scouting preparation, games, lecture schedule, and patrol assignments for supervisor review.
                </p>

                <div className="space-y-4">
                    {ta7ders.data && ta7ders.data.length > 0 ? (
                        ta7ders.data.map((t) => (
                            <Card key={t.id} padding="p-6" className="border-purple-100 bg-white">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-purple-50">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-center font-bold text-xs">
                                            {t.leader?.full_name ? t.leader.full_name[0] : 'L'}
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-slate-900">
                                                {t.leader?.full_name} • {t.feraa?.name}
                                            </h4>
                                            <span className="text-xs text-slate-400">
                                                Section: {t.feraa?.section?.name}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Badge variant="leader" size="sm">
                                            Week: {t.week_date}
                                        </Badge>
                                        {t.submitted_at ? (
                                            <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-xl border border-emerald-200">
                                                <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
                                                Submitted
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-xl border border-amber-200">
                                                <ClockIcon className="h-3.5 w-3.5 mr-1" />
                                                Draft
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                                    {t.content}
                                </div>
                            </Card>
                        ))
                    ) : (
                        <Card padding="p-12" className="text-center text-slate-400 text-sm">
                            No Ta7der submissions recorded yet. Click "Submit New Ta7der" to prepare for the week.
                        </Card>
                    )}
                </div>

                <Pagination links={ta7ders.links} />
            </div>

            {/* Modal: Submit Ta7der */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Submit Weekly Ta7der">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Select
                        label="Select Your Fera'a"
                        value={data.feraa_id}
                        onChange={(e) => setData('feraa_id', e.target.value)}
                        required
                    >
                        <option value="">Select Fera'a</option>
                        {myFeraas.map((f) => (
                            <option key={f.id} value={f.id}>
                                {f.name}
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

                    <div>
                        <label className="block text-xs font-semibold tracking-wide uppercase text-slate-600 mb-1.5">
                            Ta7der Content (Program & Objectives)
                        </label>
                        <textarea
                            rows={6}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
                            placeholder="Detail your scout meeting schedule: inspection, scout law lecture, outdoor knot practice, games, closing prayer..."
                            value={data.content}
                            onChange={(e) => setData('content', e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                        <Button variant="secondary" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={processing}>
                            {processing ? 'Submitting...' : 'Submit Ta7der'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
