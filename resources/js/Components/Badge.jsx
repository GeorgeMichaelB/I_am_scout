import React from 'react';

export default function Badge({ children, variant = 'default', size = 'md' }) {
    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
    };

    const variantClasses = {
        default: 'bg-purple-100 text-purple-800 border border-purple-200',
        dev: 'bg-rose-100 text-rose-800 border border-rose-200 font-semibold',
        super_admin: 'bg-purple-900 text-white font-semibold',
        admin: 'bg-indigo-100 text-indigo-800 border border-indigo-200 font-semibold',
        supervisor: 'bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold',
        leader: 'bg-amber-100 text-amber-850 border border-amber-300 font-semibold',
        scouter: 'bg-purple-50 text-purple-700 border border-purple-200',
        general: 'bg-blue-100 text-blue-800 border border-blue-200',
        section: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
        feraa: 'bg-purple-100 text-purple-800 border border-purple-200',
        active: 'bg-emerald-500 text-white',
        inactive: 'bg-slate-200 text-slate-700',
    };

    const chosenClass = variantClasses[variant] || variantClasses.default;

    return (
        <span className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size] || sizeClasses.md} ${chosenClass}`}>
            {children}
        </span>
    );
}
