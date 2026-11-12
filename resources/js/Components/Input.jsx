import React from 'react';

export default function Input({
    label,
    error,
    type = 'text',
    className = '',
    id,
    ...props
}) {
    const inputId = id || props.name || Math.random().toString(36).substring(7);

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={inputId} className="block text-xs font-semibold tracking-wide uppercase text-slate-600 mb-1.5">
                    {label}
                </label>
            )}
            <input
                id={inputId}
                type={type}
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-2xl text-sm text-slate-800 placeholder-slate-400 transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] ${
                    error ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200'
                } ${className}`}
                {...props}
            />
            {error && <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>}
        </div>
    );
}
