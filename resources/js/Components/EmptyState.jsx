import React from 'react';
import { FolderOpenIcon } from '@heroicons/react/24/outline';

export default function EmptyState({
    title = 'No records found',
    description = 'There are no items to display at this moment.',
    action,
}) {
    return (
        <div className="text-center py-12 px-4 rounded-3xl border-2 border-dashed border-slate-200 bg-white/50">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-scout-800 mb-4">
                <FolderOpenIcon className="h-7 w-7 text-scout-700" />
            </div>
            <h3 className="text-base font-bold text-slate-800">{title}</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">{description}</p>
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}
