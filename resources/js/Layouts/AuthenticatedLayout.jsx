import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import FlashMessage from '../Components/FlashMessage';
import Badge from '../Components/Badge';
import {
    HomeIcon,
    Squares2X2Icon,
    UsersIcon,
    BookOpenIcon,
    ClipboardDocumentCheckIcon,
    DocumentTextIcon,
    MegaphoneIcon,
    CalendarDaysIcon,
    ChatBubbleLeftRightIcon,
    ShieldCheckIcon,
    AdjustmentsHorizontalIcon,
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

export default function AuthenticatedLayout({ header, children, actionButton }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const highestRole = user?.highestRole || user?.highest_role || 'scouter';

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isDevOrAdmin = ['dev', 'super_admin', 'admin'].includes(highestRole);
    const isSuperAdmin = ['dev', 'super_admin'].includes(highestRole);
    const isSupervisorOrAbove = ['dev', 'super_admin', 'admin', 'supervisor'].includes(highestRole);
    const isLeaderOrAbove = ['dev', 'super_admin', 'admin', 'supervisor', 'leader'].includes(highestRole);

    const navigation = [
        { name: 'Dashboard', href: route('dashboard'), icon: HomeIcon, show: true },
        { name: 'Sections', href: route('sections.index'), icon: Squares2X2Icon, show: isSupervisorOrAbove },
        { name: 'Scouters', href: route('users.index'), icon: UsersIcon, show: true },
        { name: 'Lectures', href: route('lectures.index'), icon: BookOpenIcon, show: true },
        { name: 'Evaluations', href: route('evaluations.index'), icon: ClipboardDocumentCheckIcon, show: isLeaderOrAbove },
        { name: 'Ta7der', href: route('ta7der.index'), icon: DocumentTextIcon, show: isLeaderOrAbove },
        { name: 'Announcements', href: route('announcements.index'), icon: MegaphoneIcon, show: true },
        { name: 'Schedule', href: route('calendar'), icon: CalendarDaysIcon, show: true },
        { name: 'Group Chat', href: route('messages.index'), icon: ChatBubbleLeftRightIcon, show: true },
        { name: 'Roles & Access', href: route('roles.index'), icon: ShieldCheckIcon, show: isDevOrAdmin },
        { name: 'Filament Admin', href: '/admin', icon: AdjustmentsHorizontalIcon, show: isSupervisorOrAbove, external: true },
    ].filter((item) => item.show);

    const handleLogout = (e) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    return (
        <div className="min-h-screen bg-[#F7F5FA] flex flex-col md:flex-row pb-20 md:pb-0">
            <FlashMessage />

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-purple-100 z-30">
                <div className="flex items-center px-6 py-5 border-b border-purple-50">
                    <img
                        src="/images/logo.jpg"
                        alt="Logo"
                        className="h-10 w-auto object-contain"
                    />
                    <div className="ml-3">
                        <span className="text-lg font-black tracking-tight text-scout-900 block leading-tight">
                            I'm Scout
                        </span>
                        <span className="text-[9px] uppercase font-bold tracking-wider text-scout-600">
                            مجموعة مارمرقس
                        </span>
                    </div>
                </div>

                {/* User quick badge in sidebar */}
                <div className="px-5 py-4 border-b border-purple-50 bg-[#FAF7FC]/50">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800 truncate max-w-[140px]">
                                {user?.full_name}
                            </span>
                            <span className="text-[11px] font-mono text-scout-700 font-semibold">
                                {user?.scout_id || 'ID Pending'}
                            </span>
                        </div>
                        <Badge variant={highestRole} size="sm">
                            {highestRole.replace('_', ' ')}
                        </Badge>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        const active = window.location.pathname === new URL(item.href, window.location.origin).pathname;
                        const Icon = item.icon;
                        const navClass = `flex items-center px-3 py-2.5 text-xs font-semibold rounded-2xl transition-all ${
                            active
                                ? 'bg-[#6B21A8] text-white shadow-sm shadow-purple-900/20'
                                : 'text-slate-600 hover:text-scout-900 hover:bg-purple-50/70'
                        }`;

                        if (item.external) {
                            return (
                                <a key={item.name} href={item.href} className={navClass}>
                                    <Icon className={`h-4 w-4 mr-3 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                                    {item.name}
                                </a>
                            );
                        }

                        return (
                            <Link key={item.name} href={item.href} className={navClass}>
                                <Icon className={`h-4 w-4 mr-3 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <div className="p-3 border-t border-purple-50">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors"
                    >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                        Log out
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-purple-100 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                    <img src="/images/logo.jpg" alt="Logo" className="h-9 w-auto object-contain" />
                    <div>
                        <span className="text-base font-black text-scout-900 block leading-tight">I'm Scout</span>
                        <span className="text-[9px] uppercase font-bold text-scout-600">
                            {user?.scout_id || user?.full_name}
                        </span>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Badge variant={highestRole} size="sm">
                        {highestRole.replace('_', ' ')}
                    </Badge>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-1.5 rounded-xl bg-purple-50 text-scout-900 hover:bg-purple-100"
                    >
                        {mobileMenuOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
                    <div className="w-72 bg-white h-full p-6 flex flex-col shadow-2xl">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <span className="text-sm font-bold text-slate-800">Navigation Menu</span>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-1 text-slate-400 hover:text-slate-600"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <nav className="flex-1 py-4 space-y-1.5 overflow-y-auto">
                            {navigation.map((item) => {
                                const active = window.location.pathname === new URL(item.href, window.location.origin).pathname;
                                const Icon = item.icon;
                                const mClass = `flex items-center px-4 py-2.5 text-sm font-semibold rounded-2xl ${
                                    active
                                        ? 'bg-[#6B21A8] text-white'
                                        : 'text-slate-700 hover:bg-purple-50'
                                }`;

                                if (item.external) {
                                    return (
                                        <a
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={mClass}
                                        >
                                            <Icon className="h-4 w-4 mr-3" />
                                            {item.name}
                                        </a>
                                    );
                                }

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={mClass}
                                    >
                                        <Icon className="h-4 w-4 mr-3" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                        <div className="pt-4 border-t border-slate-100">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-2xl"
                            >
                                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                                Log out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 md:ml-64 flex flex-col min-w-0">
                {header && (
                    <header className="px-4 sm:px-8 pt-6 pb-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                                {header}
                            </h1>
                            {actionButton && <div>{actionButton}</div>}
                        </div>
                    </header>
                )}

                <div className="px-4 sm:px-8 py-4 flex-1">{children}</div>
            </main>

            {/* Mobile Bottom Navigation Bar (True 1-Click System) */}
            <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-purple-100 py-2 px-3 flex justify-around items-center z-40 shadow-lg">
                <Link
                    href={route('dashboard')}
                    className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-semibold ${
                        window.location.pathname === '/' ? 'text-[#6B21A8]' : 'text-slate-500'
                    }`}
                >
                    <HomeIcon className="h-5 w-5 mb-0.5" />
                    <span>Home</span>
                </Link>

                <Link
                    href={route('calendar')}
                    className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-semibold ${
                        window.location.pathname.startsWith('/calendar') ? 'text-[#6B21A8]' : 'text-slate-500'
                    }`}
                >
                    <CalendarDaysIcon className="h-5 w-5 mb-0.5" />
                    <span>Schedule</span>
                </Link>

                <Link
                    href={route('lectures.index')}
                    className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-semibold ${
                        window.location.pathname.startsWith('/lectures') ? 'text-[#6B21A8]' : 'text-slate-500'
                    }`}
                >
                    <BookOpenIcon className="h-5 w-5 mb-0.5" />
                    <span>Lectures</span>
                </Link>

                {isLeaderOrAbove ? (
                    <Link
                        href={route('evaluations.index')}
                        className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-semibold ${
                            window.location.pathname.startsWith('/evaluations') ? 'text-[#6B21A8]' : 'text-slate-500'
                        }`}
                    >
                        <ClipboardDocumentCheckIcon className="h-5 w-5 mb-0.5" />
                        <span>Eval</span>
                    </Link>
                ) : (
                    <Link
                        href={route('announcements.index')}
                        className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-semibold ${
                            window.location.pathname.startsWith('/announcements') ? 'text-[#6B21A8]' : 'text-slate-500'
                        }`}
                    >
                        <MegaphoneIcon className="h-5 w-5 mb-0.5" />
                        <span>News</span>
                    </Link>
                )}

                <Link
                    href={route('messages.index')}
                    className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-semibold ${
                        window.location.pathname.startsWith('/messages') ? 'text-[#6B21A8]' : 'text-slate-500'
                    }`}
                >
                    <ChatBubbleLeftRightIcon className="h-5 w-5 mb-0.5" />
                    <span>Chat</span>
                </Link>
            </nav>
        </div>
    );
}

