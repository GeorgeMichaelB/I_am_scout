import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import Card from '../../Components/Card';
import Button from '../../Components/Button';
import Badge from '../../Components/Badge';
import { ArrowUpRightIcon, Squares2X2Icon, UsersIcon } from '@heroicons/react/24/outline';

export default function SectionsIndex({ sections = [] }) {
    return (
        <AuthenticatedLayout header="Scout Sections">
            <Head title="Sections" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <p className="text-sm text-slate-500">
                        8 core sections of our scout troop with their respective Fera'as, leaders, and scouters.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {sections.map((section, idx) => {
                        const totalScouters = section.feraas?.reduce((acc, f) => acc + (f.scouters_count || 0), 0) || 0;
                        const totalLeaders = section.feraas?.reduce((acc, f) => acc + (f.leaders_count || 0), 0) || 0;

                        return (
                            <Link key={section.id} href={route('sections.show', section.id)}>
                                <Card
                                    hover
                                    padding="p-6"
                                    className="h-full flex flex-col justify-between border-purple-100 bg-white"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-mono font-bold text-scout-600 bg-purple-50 px-2.5 py-1 rounded-xl">
                                                0{idx + 1}
                                            </span>
                                            <Badge variant="section" size="sm">
                                                {section.feraas?.length || 0} Fera'a
                                            </Badge>
                                        </div>

                                        <h3 className="text-xl font-black text-slate-900 group-hover:text-scout-900">
                                            {section.name}
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-1 font-mono uppercase">
                                            /{section.slug}
                                        </p>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                                        <div className="flex items-center space-x-3 text-slate-500 font-semibold">
                                            <span className="flex items-center">
                                                <UsersIcon className="h-3.5 w-3.5 mr-1 text-scout-700" />
                                                {totalScouters} Scouters
                                            </span>
                                            <span>•</span>
                                            <span>{totalLeaders} Leaders</span>
                                        </div>
                                        <ArrowUpRightIcon className="h-4 w-4 text-scout-700" />
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

