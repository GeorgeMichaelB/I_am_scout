import React from 'react';

export default function Button({
    type = 'button',
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    children,
    ...props
}) {
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-xs rounded-xl',
        md: 'px-4 py-2 text-sm rounded-xl',
        lg: 'px-5 py-2.5 text-base rounded-2xl',
    };

    const variantClasses = {
        primary: 'bg-[#6B21A8] hover:bg-[#581C87] text-white shadow-sm shadow-purple-900/20 active:scale-[0.98]',
        secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm active:scale-[0.98]',
        soft: 'bg-purple-100 hover:bg-purple-200 text-[#6B21A8] font-semibold active:scale-[0.98]',
        danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm active:scale-[0.98]',
        success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-[0.98]',
        ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-[0.98]',
    };

    return (
        <button
            type={type}
            disabled={disabled}
            className={`inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.primary} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
