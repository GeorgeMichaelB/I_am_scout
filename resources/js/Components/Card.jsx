import React from 'react';

export default function Card({ children, className = '', padding = 'p-6', hover = false }) {
    return (
        <div
            className={`bg-white rounded-3xl border border-purple-100/70 shadow-[0_4px_20px_-4px_rgba(107,33,168,0.05)] ${padding} ${
                hover ? 'transition-all duration-200 hover:shadow-[0_8px_30px_-6px_rgba(107,33,168,0.12)] hover:-translate-y-0.5' : ''
            } ${className}`}
        >
            {children}
        </div>
    );
}
