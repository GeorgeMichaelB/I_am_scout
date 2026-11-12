import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import Card from '../../Components/Card';
import Button from '../../Components/Button';
import Input from '../../Components/Input';
import Select from '../../Components/Select';
import Badge from '../../Components/Badge';
import { ArrowLeftIcon, PencilSquareIcon, CheckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function UsersShow({ scouter, sections = [] }) {
    const { auth } = usePage().props;
    const currentUser = auth?.user;
    const highestRole = currentUser?.highestRole || 'scouter';

    const [isEditing, setIsEditing] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        scout_id: scouter.scout_id || '',
        full_name: scouter.full_name || '',
        email: scouter.email || '',
        gender: scouter.gender || 'male',
        phone: scouter.phone || '',
        mom_phone: scouter.mom_phone || '',
        dad_phone: scouter.dad_phone || '',
        school: scouter.school || '',
        grade: scouter.grade || '',
        sunday_school_family: scouter.sunday_school_family || '',
        address: scouter.address || '',
        diseases: scouter.diseases || '',
        notes: scouter.notes || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('users.update', scouter.id), {
            onSuccess: () => setIsEditing(false),
        });
    };

    return (
        <AuthenticatedLayout header={scouter.full_name}>
            <Head title={`Scouter - ${scouter.full_name}`} />

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Link
                        href={route('users.index')}
                        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-scout-800"
                    >
                        <ArrowLeftIcon className="h-4 w-4 mr-1" />
                        Back to Scouter Directory
                    </Link>

                    <Button
                        variant={isEditing ? 'secondary' : 'primary'}
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        <PencilSquareIcon className="h-4 w-4 mr-1.5" />
                        {isEditing ? 'Cancel Editing' : 'Edit Information'}
                    </Button>
                </div>

                {/* Profile Header Card */}
                <Card padding="p-6" className="bg-gradient-to-r from-purple-50 via-white to-purple-50/50 border-purple-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <div className="h-16 w-16 rounded-3xl bg-[#6B21A8] text-white flex items-center justify-center text-2xl font-black shadow-md">
                                {scouter.full_name ? scouter.full_name[0] : 'S'}
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900">{scouter.full_name}</h2>
                                <span className="font-mono text-xs font-bold text-scout-700 block mt-0.5">
                                    Scout ID: {scouter.scout_id || 'ID Pending'}
                                </span>
                                <span className="text-xs text-slate-400">{scouter.email}</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                            {scouter.roles?.map((r) => (
                                <Badge key={r.id} variant={r.role} size="md">
                                    {r.role} {r.section ? `• ${r.section.name}` : ''} {r.feraa ? `• ${r.feraa.name}` : ''}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Details Form / Display */}
                <Card padding="p-8" className="border-purple-100">
                    <form onSubmit={submit} className="space-y-6">
                        {/* Scouting & Personal */}
                        <div>
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 pb-2 border-b border-purple-50 mb-4">
                                Scout Identity & Gender
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Input
                                    label="Unique Scout ID"
                                    value={data.scout_id}
                                    disabled={!isEditing}
                                    onChange={(e) => setData('scout_id', e.target.value)}
                                    error={errors.scout_id}
                                />
                                <Input
                                    label="Full Name"
                                    value={data.full_name}
                                    disabled={!isEditing}
                                    onChange={(e) => setData('full_name', e.target.value)}
                                    error={errors.full_name}
                                />
                                <Select
                                    label="Gender"
                                    value={data.gender}
                                    disabled={!isEditing}
                                    onChange={(e) => setData('gender', e.target.value)}
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </Select>
                            </div>
                        </div>

                        {/* Contacts */}
                        <div>
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 pb-2 border-b border-purple-50 mb-4">
                                Contact Information
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Input
                                    label="Personal Phone"
                                    value={data.phone}
                                    disabled={!isEditing}
                                    onChange={(e) => setData('phone', e.target.value)}
                                />
                                <Input
                                    label="Mom's Phone"
                                    value={data.mom_phone}
                                    disabled={!isEditing}
                                    onChange={(e) => setData('mom_phone', e.target.value)}
                                />
                                <Input
                                    label="Dad's Phone"
                                    value={data.dad_phone}
                                    disabled={!isEditing}
                                    onChange={(e) => setData('dad_phone', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* School & Church */}
                        <div>
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 pb-2 border-b border-purple-50 mb-4">
                                School & Church Group
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Input
                                    label="School"
                                    value={data.school}
                                    disabled={!isEditing}
                                    onChange={(e) => setData('school', e.target.value)}
                                />
                                <Input
                                    label="Grade"
                                    value={data.grade}
                                    disabled={!isEditing}
                                    onChange={(e) => setData('grade', e.target.value)}
                                />
                                <Input
                                    label="Sunday School Family"
                                    value={data.sunday_school_family}
                                    disabled={!isEditing}
                                    onChange={(e) => setData('sunday_school_family', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Address & Medical */}
                        <div>
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 pb-2 border-b border-purple-50 mb-4">
                                Address, Medical & Scout Notes
                            </h3>
                            <div className="space-y-4">
                                <Input
                                    label="Home Address"
                                    value={data.address}
                                    disabled={!isEditing}
                                    onChange={(e) => setData('address', e.target.value)}
                                />

                                <Input
                                    label="Diseases & Health Notes"
                                    value={data.diseases}
                                    disabled={!isEditing}
                                    onChange={(e) => setData('diseases', e.target.value)}
                                />

                                <div>
                                    <label className="block text-xs font-semibold tracking-wide uppercase text-slate-600 mb-1.5">
                                        Leader Notes
                                    </label>
                                    <textarea
                                        rows={3}
                                        disabled={!isEditing}
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 disabled:opacity-75 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
                                    />
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
                                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" disabled={processing}>
                                    <CheckIcon className="h-4 w-4 mr-1.5" />
                                    {processing ? 'Saving Changes...' : 'Save Changes'}
                                </Button>
                            </div>
                        )}
                    </form>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
