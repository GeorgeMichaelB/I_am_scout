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
    BookOpenIcon,
    ArrowUpRightIcon,
    DocumentTextIcon,
    CalendarIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';

export default function LecturesIndex({ lectures, sections = [] }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const highestRole = user?.highestRole || 'scouter';

    const canUpload = ['dev', 'super_admin', 'admin', 'supervisor', 'leader'].includes(highestRole);

    const [modalOpen, setModalOpen] = useState(false);
    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        content: '',
        week_date: new Date().toISOString().split('T')[0],
        section_id: '',
        feraa_id: '',
        file: null,
    });

    const selectedSec = sections.find((s) => s.id === parseInt(data.section_id));
    const availableFeraas = selectedSec?.feraas || [];

    const handleUpload = (e) => {
        e.preventDefault();
        post(route('lectures.store'), {
            onSuccess: () => {
                setModalOpen(false);
                reset();
            },
        });
    };

    return (
        <AuthenticatedLayout
            header="Syllabus & Scout Lectures"
            actionButton={
                canUpload && (
                    <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
                        <PlusIcon className="h-4 w-4 mr-1.5" />
                        Add Lecture
                    </Button>
                )
            }
        >
            <Head title="Lectures" />

            <div className="space-y-6">
                <p className="text-sm text-slate-500">
                    Weekly curriculum, educational sessions, scouting knotting techniques, and campfire stories.
                </p>

                {/* Lectures Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {lectures.data && lectures.data.length > 0 ? (
                        lectures.data.map((lecture) => (
                            <Card
                                key={lecture.id}
                                padding="p-6"
                                hover
                                className="h-full flex flex-col justify-between border-purple-100 bg-white"
                            >
                                <div>
                                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                                        <div className="flex items-center space-x-1 font-semibold text-scout-700">
                                            <CalendarIcon className="h-3.5 w-3.5" />
                                            <span>Week: {lecture.week_date}</span>
                                        </div>
                                        <Badge variant="feraa" size="sm">
                                            {lecture.feraa?.name || 'Fera\'a'}
                                        </Badge>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900 mt-2 leading-tight">
                                        {lecture.title}
                                    </h3>

                                    <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                                        {lecture.content || 'Scouting materials and syllabus guidelines.'}
                                    </p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                                    <span className="text-slate-400 text-[11px]">
                                        By: {lecture.author?.full_name || 'Leader'}
                                    </span>

                                    <Link
                                        href={route('lectures.show', lecture.id)}
                                        className="inline-flex items-center font-bold text-scout-700 hover:text-scout-900"
                                    >
                                        View Details
                                        <ArrowUpRightIcon className="h-3.5 w-3.5 ml-1" />
                                    </Link>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full">
                            <Card padding="p-12" className="text-center text-slate-400 text-sm">
                                No lectures uploaded yet.
                            </Card>
                        </div>
                    )}
                </div>

                <Pagination links={lectures.links} />
            </div>

            {/* Modal: Add Lecture */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Upload Weekly Lecture">
                <form onSubmit={handleUpload} className="space-y-4">
                    <Input
                        label="Lecture Title"
                        placeholder="e.g. Pioneering Knots & Lashings"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        required
                        error={errors.title}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Select
                            label="Section"
                            value={data.section_id}
                            onChange={(e) => setData('section_id', e.target.value)}
                            required
                        >
                            <option value="">Select Section</option>
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
                            required
                            disabled={!data.section_id}
                        >
                            <option value="">Select Fera'a</option>
                            {availableFeraas.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.name}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <Input
                        label="Week Date"
                        type="date"
                        value={data.week_date}
                        onChange={(e) => setData('week_date', e.target.value)}
                        required
                    />

                    <div>
                        <label className="block text-xs font-semibold tracking-wide uppercase text-slate-600 mb-1.5">
                            Content & Guidelines
                        </label>
                        <textarea
                            rows={4}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
                            placeholder="Write the summary or key lecture points..."
                            value={data.content}
                            onChange={(e) => setData('content', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold tracking-wide uppercase text-slate-600 mb-1.5">
                            Attachment File (PDF, DOCX, Image)
                        </label>
                        <input
                            type="file"
                            onChange={(e) => setData('file', e.target.files[0])}
                            className="text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-scout-800 file:text-white hover:file:bg-scout-900 cursor-pointer"
                        />
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                        <Button variant="secondary" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={processing}>
                            {processing ? 'Uploading...' : 'Publish Lecture'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
