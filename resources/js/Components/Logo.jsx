import React from 'react';

export default function Logo({ className = "h-12 w-auto", showText = false, textClassName = "text-xl font-bold text-scout-900" }) {
    return (
        <div className="flex items-center space-x-3">
            <img
                src="/images/logo.jpg"
                alt="I'm Scout Logo"
                className={`object-contain transition-transform hover:scale-105 ${className}`}
            />
            {showText && (
                <div className="flex flex-col">
                    <span className={textClassName}>I'm Scout</span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-scout-600">الكشفية الجوية</span>
                </div>
            )}
        </div>
    );
}
