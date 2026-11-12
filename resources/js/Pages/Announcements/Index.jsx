import React, { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
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
    MegaphoneIcon,
    TrashIcon,
    CalendarIcon,
    UserIcon,
} from '@heroicons/react/24/outline';

export default function AnnouncementsIndex({ announcements, sections = [] }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const highestRole = user?.highestRole || 'scouter';

    const canPost = ['dev', 'super_admin', 'admin', 'supervisor', 'leader'].includes(highestRole);

    const [modalOpen, setModalOpen] = useState(false);
    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        body: '',
        scope: highestRole === 'leader' ? 'feraa' : highestRole === 'supervisor' ? 'section' : 'general',
        section_id: '',
        feraa_id: '',
    });

    const selectedSec = sections.find((s) => s.id === parseInt(data.section_id));
    const availableFeraas = selectedSec?.feraas || [];

    const handlePublish = (e) => {
        e.preventDefault();
        post(route('announcements.store'), {
            onSuccess: () => {
                setModalOpen(false);
                reset();
            },
        });
    };

    const handleDelete = (id) => {
        if (confirm('Delete this announcement?')) {
            router.delete(route('announcements.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header="Directives & Announcements"
            actionButton={
                canPost && (
                    <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
                        <PlusIcon className="h-4 w-4 mr-1.5" />
                        Publish Announcement
                    </Button>
                )
            }
        >
            <Head title="Announcements" />

            <div className="space-y-6">
                <p className="text-sm text-slate-500">
                    Official announcements, rally instructions, meeting locations, and uniform notifications.
                </p>

                <div className="space-y-4">
                    {announcements.data && announcements.data.length > 0 ? (
                        announcements.data.map((a) => (
                            <Card
                                key={a.id}
                                padding="p-6"
                                className={`border-purple-100 bg-white border-l-4 ${
                                    a.scope === 'general'
                                        ? 'border-l-purple-600'
                                        : a.scope === 'section'
                                        ? 'border-l-emerald-500'
                                        : 'border-l-amber-500'
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-purple-50">
                                    <div className="flex items-center space-x-2">
                                        <Badge variant={a.scope} size="sm">
                                            {a.scope} Announcement
                                        </Badge>
                                        {a.section && (
                                            <span className="text-xs font-semibold text-slate-500">
                                                • {a.section.name}
                                            </span>
                                        )}
                                        {a.feraa && (
                                            <span className="text-xs font-semibold text-slate-500">
                                                • {a.feraa.name}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-3 text-xs text-slate-400">
                                        <span className="flex items-center">
                                            <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                                            {new Date(a.created_at).toLocaleDateString()}
                                        </span>
                                        {canPost && (
                                            <button
                                                onClick={() => handleDelete(a.id)}
                                                className="text-rose-500 hover:text-rose-700"
                                                title="Delete"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <h3 className="text-base font-extrabold text-slate-900 mt-3">{a.title}</h3>
                                <p className="text-xs sm:text-sm text-slate-700 mt-2 leading-relaxed whitespace-pre-line">
                                    {a.body}
                                </p>

                                <div className="mt-4 pt-3 border-t border-purple-50 text-[11px] text-slate-400 flex items-center">
                                    <UserIcon className="h-3.5 w-3.5 mr-1 text-scout-600" />
                                    <span>Issued by {a.author?.full_name || 'Administration'}</span>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <Card padding="p-12" className="text-center text-slate-400 text-sm">
                            No announcements published yet.
                        </Card>
                    )}
                </div>

                <Pagination links={announcements.links} />
            </div>

            {/* Modal: Publish Announcement */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Publish Announcement">
                <form onSubmit={handlePublish} className="space-y-4">
                    <Input
                        label="Headline / Title"
                        placeholder="e.g. Mandatory Uniform Inspection Next Friday"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        required
                        error={errors.title}
                    />

                    <Select
                        label="Target Scope"
                        value={data.scope}
                        onChange={(e) => setData('scope', e.target.value)}
                        required
                    >
                        {['dev', 'super_admin', 'admin'].includes(highestRole) && (
                            <option value="general">General (Entire Scout Group)</option>
                        )}
                        {['dev', 'super_admin', 'admin', 'supervisor'].includes(highestRole) && (
                            <option value="section">Specific Section</option>
                        )}
                        <option value="feraa">Specific Fera'a</option>
                    </Select>

                    {data.scope !== 'general' && (
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
                    )}

                    {data.scope === 'feraa' && (
                        <Select
                            label="Fera'a"
                            value={data.feraa_id}
                            onChange={(e) => setData('feraa_id', e.target.value)}
                            disabled={!data.section_id}
                        >
                            <option value="">Select Fera'a</option>
                            {availableFeraas.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.name}
                                </option>
                            ))}
                        </Select>
                    )}

                    <div>
                        <label className="block text-xs font-semibold tracking-wide uppercase text-slate-600 mb-1.5">
                            Announcement Body
                        </label>
                        <textarea
                            rows={5}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
                            placeholder="Detailed directive message..."
                            value={data.body}
                            onChange={(e) => setData('body', e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                        <Button variant="secondary" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={processing}>
                            {processing ? 'Publishing...' : 'Publish'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}

