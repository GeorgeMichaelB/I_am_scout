import React from 'react';
import { Link } from '@inertiajs/react';

export default function Pagination({ links = [] }) {
    if (!links || links.length <= 3) return null;

    return (
        <div className="flex items-center justify-center space-x-1.5 mt-6">
            {links.map((link, idx) => {
                if (!link.url) {
                    return (
                        <span
                            key={idx}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            className="px-3.5 py-1.5 text-xs text-slate-400 bg-slate-100 rounded-xl cursor-not-allowed select-none"
                        />
                    );
                }

                return (
                    <Link
                        key={idx}
                        href={link.url}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                            link.active
                                ? 'bg-[#6B21A8] text-white shadow-sm'
                                : 'bg-white text-slate-700 hover:bg-purple-50 hover:text-scout-800 border border-slate-200'
                        }`}
                    />
                );
            })}
        </div>
    );
}
