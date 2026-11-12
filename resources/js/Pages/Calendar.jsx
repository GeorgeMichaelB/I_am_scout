import React, { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import Card from '../Components/Card';
import Button from '../Components/Button';
import Badge from '../Components/Badge';
import Modal from '../Components/Modal';
import Input from '../Components/Input';
import Select from '../Components/Select';
import {
    PlusIcon,
    ClockIcon,
    CalendarIcon,
    MapPinIcon,
    TrashIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from '@heroicons/react/24/outline';

export default function CalendarPage({ events = [], sections = [] }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const highestRole = user?.highestRole || 'scouter';

    const canAddEvents = ['dev', 'super_admin', 'admin', 'supervisor'].includes(highestRole);

    const [modalOpen, setModalOpen] = useState(false);
    const { data, setData, post, processing, reset, errors } = useForm({
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

    // Date navigation state
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Generate week days around selected date
    const getWeekDays = (baseDate) => {
        const days = [];
        const start = new Date(baseDate);
        const dayOfWeek = start.getDay(); // 0 is Sunday
        const distanceToMonday = (dayOfWeek + 6) % 7;
        start.setDate(start.getDate() - distanceToMonday);

        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            days.push(d);
        }
        return days;
    };

    const weekDays = getWeekDays(selectedDate);
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const isSameDay = (d1, d2) => {
        return (
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate()
        );
    };

    // Filter events for selected date
    const dayEvents = events.filter((evt) => {
        const evtDate = new Date(evt.start_time);
        return isSameDay(evtDate, selectedDate);
    });

    const monthYear = selectedDate.toLocaleDateString([], { month: 'long', year: 'numeric' });

    // Move next/previous week
    const changeWeek = (direction) => {
        const next = new Date(selectedDate);
        next.setDate(next.getDate() + direction * 7);
        setSelectedDate(next);
    };

    return (
        <AuthenticatedLayout
            header="Schedule & Timing"
            actionButton={
                canAddEvents && (
                    <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
                        <PlusIcon className="h-4 w-4 mr-1.5" />
                        Add Event
                    </Button>
                )
            }
        >
            <Head title="Calendar & Schedule" />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Week Selector Bar (Directly inspired by the 3rd mockup in reference image) */}
                <Card padding="p-6" className="bg-white border-purple-100 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center space-x-2">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">
                                {monthYear}
                            </h2>
                            <div className="flex items-center space-x-1 ml-3">
                                <button
                                    onClick={() => changeWeek(-1)}
                                    className="p-1 rounded-xl hover:bg-purple-50 text-slate-500 hover:text-scout-900 transition-colors"
                                >
                                    <ChevronLeftIcon className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => changeWeek(1)}
                                    className="p-1 rounded-xl hover:bg-purple-50 text-slate-500 hover:text-scout-900 transition-colors"
                                >
                                    <ChevronRightIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedDate(new Date())}
                            className="text-xs font-bold text-scout-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 transition-colors"
                        >
                            Today
                        </button>
                    </div>

                    {/* Day Pills (Mon 11, Tue 12, etc.) */}
                    <div className="grid grid-cols-7 gap-2">
                        {weekDays.map((d, index) => {
                            const selected = isSameDay(d, selectedDate);
                            const hasEvents = events.some((e) => isSameDay(new Date(e.start_time), d));

                            return (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => setSelectedDate(d)}
                                    className={`flex flex-col items-center py-3 px-2 rounded-2xl transition-all cursor-pointer ${
                                        selected
                                            ? 'bg-slate-900 text-white shadow-md scale-105'
                                            : 'bg-[#F9F7FC] hover:bg-purple-50/80 text-slate-700 border border-purple-50'
                                    }`}
                                >
                                    <span className={`text-[11px] font-bold ${selected ? 'text-slate-300' : 'text-slate-400'}`}>
                                        {dayNames[index]}
                                    </span>
                                    <span className="text-lg font-black mt-1">{d.getDate()}</span>
                                    {hasEvents && (
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full mt-1.5 ${
                                                selected ? 'bg-purple-400' : 'bg-scout-700'
                                            }`}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </Card>

                {/* Day Schedule Timeline (Styled to match the reference mockup's 10 AM, 11 AM cards) */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-extrabold text-slate-900">
                            Schedule for {selectedDate.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                        </h3>
                        <span className="text-xs font-semibold text-slate-400">
                            {dayEvents.length} event(s) scheduled
                        </span>
                    </div>

                    {dayEvents.length > 0 ? (
                        <div className="space-y-4">
                            {dayEvents.map((evt, idx) => {
                                const startTime = new Date(evt.start_time);
                                const endTime = new Date(evt.end_time);
                                const timeStr = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                const endStr = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                // Alternating soft pastel theme inspired by mockup
                                const cardColor =
                                    idx % 3 === 0
                                        ? 'bg-[#F9ECEC] border-rose-200/60'
                                        : idx % 3 === 1
                                        ? 'bg-[#EBF5ED] border-emerald-200/60'
                                        : 'bg-[#F0ECF8] border-purple-200/60';

                                return (
                                    <div key={evt.id} className="flex items-start space-x-4">
                                        <div className="w-16 shrink-0 pt-3 text-right">
                                            <span className="text-sm font-black text-slate-800">{timeStr}</span>
                                        </div>

                                        <div className={`flex-1 rounded-3xl p-6 border shadow-xs ${cardColor}`}>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center space-x-2 mb-1.5">
                                                        <Badge variant={evt.section ? 'section' : 'general'} size="sm">
                                                            {evt.section ? evt.section.name : 'All Sections'}
                                                        </Badge>
                                                        <span className="text-xs text-slate-500 font-semibold flex items-center">
                                                            <ClockIcon className="h-3.5 w-3.5 mr-1" />
                                                            {timeStr} - {endStr}
                                                        </span>
                                                    </div>

                                                    <h4 className="text-lg font-black text-slate-900">{evt.title}</h4>

                                                    {evt.description && (
                                                        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                                                            {evt.description}
                                                        </p>
                                                    )}
                                                </div>

                                                {canAddEvents && (
                                                    <button
                                                        onClick={() => handleDeleteEvent(evt.id)}
                                                        className="text-slate-400 hover:text-rose-600 p-1"
                                                        title="Delete Event"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <Card padding="p-12" className="text-center text-slate-400 text-sm bg-white/70">
                            No events scheduled for this day.
                            {canAddEvents && (
                                <div className="mt-3">
                                    <Button variant="soft" size="sm" onClick={() => setModalOpen(true)}>
                                        Schedule Event
                                    </Button>
                                </div>
                            )}
                        </Card>
                    )}
                </div>
            </div>

            {/* Modal: Add Event */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Scout Event / Rally">
                <form onSubmit={handleCreateEvent} className="space-y-4">
                    <Input
                        label="Event Title"
                        placeholder="e.g. Weekly Inspection & Marching Drill"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        required
                        error={errors.title}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                            label="Start Date & Time"
                            type="datetime-local"
                            value={data.start_time}
                            onChange={(e) => setData('start_time', e.target.value)}
                            required
                            error={errors.start_time}
                        />

                        <Input
                            label="End Date & Time"
                            type="datetime-local"
                            value={data.end_time}
                            onChange={(e) => setData('end_time', e.target.value)}
                            required
                            error={errors.end_time}
                        />
                    </div>

                    <Select
                        label="Applicable Section"
                        value={data.section_id}
                        onChange={(e) => setData('section_id', e.target.value)}
                    >
                        <option value="">All Scout Sections (General Event)</option>
                        {sections.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name} Only
                            </option>
                        ))}
                    </Select>

                    <div>
                        <label className="block text-xs font-semibold tracking-wide uppercase text-slate-600 mb-1.5">
                            Description & Location Notes
                        </label>
                        <textarea
                            rows={3}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
                            placeholder="Venue, required scout equipment, uniform rules..."
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                        <Button variant="secondary" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={processing}>
                            {processing ? 'Saving...' : 'Add to Schedule'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
