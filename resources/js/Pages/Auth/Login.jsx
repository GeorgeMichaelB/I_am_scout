import React from 'react';
import { useForm, Head } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';
import Card from '../../Components/Card';
import Button from '../../Components/Button';
import Input from '../../Components/Input';
import { LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    const fillRole = (email, pass = 'password') => {
        setData({
            email,
            password: pass,
            remember: true,
        });
    };

    return (
        <GuestLayout>
            <Head title="Sign In" />

            <Card className="shadow-xl border-purple-100" padding="p-8">
                <div className="mb-6 text-center">
                    <h2 className="text-xl font-extrabold text-slate-800">
                        Sign In to Your Scout Account
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                        Enter your Email or Unique Scout ID
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <Input
                        label="Email or Scout ID"
                        type="text"
                        name="email"
                        value={data.email}
                        placeholder="e.g. leader@scout.com or ASH-F1-001"
                        autoComplete="username"
                        autoFocus
                        onChange={(e) => setData('email', e.target.value)}
                        error={errors.email}
                    />

                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        value={data.password}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        error={errors.password}
                    />

                    <div className="flex items-center justify-between text-xs pt-1">
                        <label className="flex items-center cursor-pointer select-none">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded-lg text-scout-800 focus:ring-purple-500 h-4 w-4 border-slate-300"
                            />
                            <span className="ml-2 text-slate-600 font-medium">Keep me signed in</span>
                        </label>
                    </div>

                    <Button
                        type="submit"
                        className="w-full py-3 text-sm font-bold mt-2"
                        disabled={processing}
                    >
                        {processing ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>

                {/* 1-Click Role Switcher for seamless testing */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
                        Quick Demo Sign In (1-Click)
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <button
                            type="button"
                            onClick={() => fillRole('admin@scout.com')}
                            className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-semibold text-left transition-colors border border-purple-200/60"
                        >
                            <span className="block text-[10px] text-purple-600 font-mono">Role</span>
                            Admin
                        </button>

                        <button
                            type="button"
                            onClick={() => fillRole('supervisor@scout.com')}
                            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold text-left transition-colors border border-emerald-200/60"
                        >
                            <span className="block text-[10px] text-emerald-600 font-mono">Role</span>
                            Supervisor
                        </button>

                        <button
                            type="button"
                            onClick={() => fillRole('leader@scout.com')}
                            className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-left transition-colors border border-amber-200/60"
                        >
                            <span className="block text-[10px] text-amber-600 font-mono">Role</span>
                            Leader
                        </button>

                        <button
                            type="button"
                            onClick={() => fillRole('scouter@scout.com')}
                            className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-semibold text-left transition-colors border border-blue-200/60"
                        >
                            <span className="block text-[10px] text-blue-600 font-mono">Role</span>
                            Scouter
                        </button>
                    </div>
                </div>
            </Card>
        </GuestLayout>
    );
}

