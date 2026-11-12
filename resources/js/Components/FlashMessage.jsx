import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { CheckCircleIcon, ExclamationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function FlashMessage() {
    const { flash } = usePage().props;
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState('success');

    useEffect(() => {
        if (flash?.success) {
            setMessage(flash.success);
            setType('success');
            setVisible(true);
        } else if (flash?.error) {
            setMessage(flash.error);
            setType('error');
            setVisible(true);
        } else if (flash?.info) {
            setMessage(flash.info);
            setType('info');
            setVisible(true);
        }
    }, [flash]);

    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => setVisible(false), 4500);
            return () => clearTimeout(timer);
        }
    }, [visible]);

    if (!visible || !message) return null;

    const isSuccess = type === 'success';

    return (
        <div className="fixed top-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-top-4 duration-300">
            <div
                className={`flex items-start p-4 rounded-2xl shadow-xl border ${
                    isSuccess
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
            >
                {isSuccess ? (
                    <CheckCircleIcon className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                ) : (
                    <ExclamationCircleIcon className="h-5 w-5 text-rose-600 mt-0.5 shrink-0" />
                )}
                <div className="ml-3 flex-1 text-sm font-medium">{message}</div>
                <button
                    onClick={() => setVisible(false)}
                    className="ml-3 shrink-0 text-slate-400 hover:text-slate-600 p-1"
                >
                    <XMarkIcon className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

