import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import Card from '../../Components/Card';
import Button from '../../Components/Button';
import Input from '../../Components/Input';
import Select from '../../Components/Select';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function UsersCreate({ sections = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        scout_id: '',
        full_name: '',
        email: '',
        password: '',
        gender: 'male',
        phone: '',
        mom_phone: '',
        dad_phone: '',
        school: '',
        grade: '',
        sunday_school_family: '',
        address: '',
        diseases: '',
        notes: '',
        role: 'scouter',
        section_id: '',
        feraa_id: '',
    });

    const selectedSectionObj = sections.find((s) => s.id === parseInt(data.section_id));
    const availableFeraas = selectedSectionObj?.feraas || [];

    const handleSectionChange = (secId) => {
        setData((prev) => ({
            ...prev,
            section_id: secId,
            feraa_id: '',
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('users.store'));
    };

    return (
        <AuthenticatedLayout header="Register New Scout Member">
            <Head title="Add Member" />

            <div className="max-w-3xl mx-auto space-y-6">
                <Link
                    href={route('users.index')}
                    className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-scout-800"
                >
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Back to Scouter Directory
                </Link>

                <Card padding="p-8" className="border-purple-100">
                    <form onSubmit={submit} className="space-y-6">
                        {/* Section: Basic Identity */}
                        <div>
                            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-purple-50">
                                1. Personal & Scouting Identity
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Human-Readable Scout ID"
                                    placeholder="e.g. ASH-F1-005"
                                    value={data.scout_id}
                                    onChange={(e) => setData('scout_id', e.target.value)}
                                    error={errors.scout_id}
                                />

                                <Input
                                    label="Full Name"
                                    placeholder="Scouter full name"
                                    value={data.full_name}
                                    onChange={(e) => setData('full_name', e.target.value)}
                                    required
                                    error={errors.full_name}
                                />

                                <Input
                                    label="Email Address"
                                    type="email"
                                    placeholder="name@scout.com"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    error={errors.email}
                                />

                                <Input
                                    label="Password (leave empty for default 'password')"
                                    type="password"
                                    placeholder="••••••••"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    error={errors.password}
                                />

                                <Select
                                    label="Gender"
                                    value={data.gender}
                                    onChange={(e) => setData('gender', e.target.value)}
                                    required
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </Select>

                                <Select
                                    label="Initial Role"
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    required
                                >
                                    <option value="scouter">Scouter</option>
                                    <option value="leader">Leader</option>
                                    <option value="supervisor">Supervisor</option>
                                    <option value="admin">Admin</option>
                                    <option value="super_admin">Super Admin</option>
                                </Select>
                            </div>
                        </div>

                        {/* Section: Assignment */}
                        <div>
                            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-purple-50">
                                2. Section & Fera'a Assignment
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Select
                                    label="Scout Section"
                                    value={data.section_id}
                                    onChange={(e) => handleSectionChange(e.target.value)}
                                    placeholder="Choose Section"
                                >
                                    <option value="">Choose Section</option>
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
                                    placeholder="Choose Fera'a"
                                >
                                    <option value="">Choose Fera'a</option>
                                    {availableFeraas.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.name}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        {/* Section: Contacts */}
                        <div>
                            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-purple-50">
                                3. Contact Numbers
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Input
                                    label="Personal Phone"
                                    placeholder="+201..."
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                />
                                <Input
                                    label="Mom's Phone"
                                    placeholder="+201..."
                                    value={data.mom_phone}
                                    onChange={(e) => setData('mom_phone', e.target.value)}
                                />
                                <Input
                                    label="Dad's Phone"
                                    placeholder="+201..."
                                    value={data.dad_phone}
                                    onChange={(e) => setData('dad_phone', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Section: Education & Church */}
                        <div>
                            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-purple-50">
                                4. School & Sunday School Details
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Input
                                    label="School"
                                    placeholder="School name"
                                    value={data.school}
                                    onChange={(e) => setData('school', e.target.value)}
                                />
                                <Input
                                    label="Grade"
                                    placeholder="e.g. Grade 5"
                                    value={data.grade}
                                    onChange={(e) => setData('grade', e.target.value)}
                                />
                                <Input
                                    label="Sunday School Family"
                                    placeholder="Family name"
                                    value={data.sunday_school_family}
                                    onChange={(e) => setData('sunday_school_family', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Section: Address, Health & Notes */}
                        <div>
                            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-purple-50">
                                5. Health, Address & Notes
                            </h3>
                            <div className="space-y-4">
                                <Input
                                    label="Address"
                                    placeholder="Home address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                />
                                <Input
                                    label="Diseases or Medical Conditions"
                                    placeholder="Allergies, asthma, chronic illness, or 'None'"
                                    value={data.diseases}
                                    onChange={(e) => setData('diseases', e.target.value)}
                                />
                                <div>
                                    <label className="block text-xs font-semibold tracking-wide uppercase text-slate-600 mb-1.5">
                                        Leader Notes
                                    </label>
                                    <textarea
                                        rows={3}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                                        placeholder="Special scouting skills, behavioral notes, etc."
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                            <Link href={route('users.index')}>
                                <Button variant="secondary">Cancel</Button>
                            </Link>
                            <Button type="submit" variant="primary" disabled={processing}>
                                {processing ? 'Registering...' : 'Register Scouter'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
