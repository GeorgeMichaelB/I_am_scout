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
    CalendarDaysIcon,
    ClockIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';

export default function EventsIndex({ events, sections = [] }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const highestRole = user?.highestRole || user?.highest_role || 'scouter';

    const canAddEvents = ['dev', 'super_admin', 'admin', 'supervisor'].includes(highestRole);

    const [modalOpen, setModalOpen] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        section_id: '',
    });

    const handleCreateEvent = (e) => {
        e.preventDefault();
        post(route('events.store'), {
            onSuccess: () => {
                setModalOpen(false);
                reset();
            },
        });
    };

    const handleDeleteEvent = (id) => {
        if (confirm('Delete this event?')) {
            router.delete(route('events.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header="Events Directory"
            actionButton={
                <div className="flex items-center space-x-2">
                    <Link href={route('calendar')}>
                        <Button variant="secondary" size="md">
                            <CalendarDaysIcon className="h-4 w-4 mr-1.5" />
                            View Calendar
                        </Button>
                    </Link>

                    {canAddEvents && (
                        <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
                            <PlusIcon className="h-4 w-4 mr-1.5" />
                            Schedule Event
                        </Button>
                    )}
                </div>
            }
        >
            <Head title="Events" />

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {events.data && events.data.length > 0 ? (
                        events.data.map((evt) => (
                            <Card key={evt.id} padding="p-6" className="border-purple-100 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge variant={evt.section ? 'section' : 'general'} size="sm">
                                            {evt.section ? evt.section.name : 'General (All)'}
                                        </Badge>
                                        {canAddEvents && (
                                            <button
                                                onClick={() => handleDeleteEvent(evt.id)}
                                                className="text-slate-400 hover:text-rose-600"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>

                                    <h4 className="text-base font-bold text-slate-900 mt-2">{evt.title}</h4>
                                    {evt.description && (
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-3">{evt.description}</p>
                                    )}
                                </div>

                                <div className="mt-6 pt-3 border-t border-slate-100 text-xs text-slate-400 space-y-1">
                                    <div className="flex items-center text-scout-800 font-semibold">
                                        <ClockIcon className="h-3.5 w-3.5 mr-1" />
                                        <span>
                                            {new Date(evt.start_time).toLocaleString([], {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full">
                            <Card padding="p-12" className="text-center text-slate-400 text-sm">
                                No events found.
                            </Card>
                        </div>
                    )}
                </div>

                <Pagination links={events.links} />
            </div>

            {/* Modal: Add Event */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Schedule Event">
                <form onSubmit={handleCreateEvent} className="space-y-4">
                    <Input
                        label="Event Title"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        required
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                            label="Start Date & Time"
                            type="datetime-local"
                            value={data.start_time}
                            onChange={(e) => setData('start_time', e.target.value)}
                            required
                        />

                        <Input
                            label="End Date & Time"
                            type="datetime-local"
                            value={data.end_time}
                            onChange={(e) => setData('end_time', e.target.value)}
                            required
                        />
                    </div>

                    <Select
                        label="Section Scope"
                        value={data.section_id}
                        onChange={(e) => setData('section_id', e.target.value)}
                    >
                        <option value="">All Scout Sections</option>
                        {sections.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </Select>

                    <div>
                        <label className="block text-xs font-semibold tracking-wide uppercase text-slate-600 mb-1.5">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                        <Button variant="secondary" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={processing}>
                            {processing ? 'Saving...' : 'Add Event'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}

