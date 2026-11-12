import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import Card from '../../Components/Card';
import Button from '../../Components/Button';
import Badge from '../../Components/Badge';
import {
    ArrowLeftIcon,
    ArrowDownTrayIcon,
    CalendarIcon,
    TrashIcon,
    UserIcon,
} from '@heroicons/react/24/outline';

export default function LecturesShow({ lecture }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const highestRole = user?.highestRole || 'scouter';

    const canDelete = ['dev', 'super_admin', 'admin', 'supervisor'].includes(highestRole);

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this lecture?')) {
            router.delete(route('lectures.destroy', lecture.id));
        }
    };

    return (
        <AuthenticatedLayout header={lecture.title}>
            <Head title={lecture.title} />

            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Link
                        href={route('lectures.index')}
                        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-scout-800"
                    >
                        <ArrowLeftIcon className="h-4 w-4 mr-1" />
                        Back to Lectures
                    </Link>

                    {canDelete && (
                        <Button variant="danger" size="sm" onClick={handleDelete}>
                            <TrashIcon className="h-4 w-4 mr-1.5" />
                            Delete Lecture
                        </Button>
                    )}
                </div>

                <Card padding="p-8" className="border-purple-100 bg-white">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <Badge variant="section" size="sm">
                            {lecture.section?.name}
                        </Badge>
                        <Badge variant="feraa" size="sm">
                            {lecture.feraa?.name}
                        </Badge>
                        <span className="text-xs text-slate-400 flex items-center font-semibold ml-auto">
                            <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                            Week: {lecture.week_date}
                        </span>
                    </div>

                    <h1 className="text-2xl font-black text-slate-900 mb-2">
                        {lecture.title}
                    </h1>

                    <div className="flex items-center text-xs text-slate-500 pb-6 border-b border-purple-50">
                        <UserIcon className="h-3.5 w-3.5 mr-1 text-scout-700" />
                        <span>Published by {lecture.author?.full_name || 'Leader'}</span>
                    </div>

                    <div className="py-6 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {lecture.content || 'No text content attached to this lecture.'}
                    </div>

                    {lecture.file_path && (
                        <div className="pt-6 border-t border-purple-50">
                            <a
                                href={`/storage/${lecture.file_path}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center px-4 py-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-scout-800 text-xs font-bold border border-purple-200 transition-colors"
                            >
                                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                                Download Attached Lecture File
                            </a>
                        </div>
                    )}
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
