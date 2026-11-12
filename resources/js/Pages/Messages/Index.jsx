import React, { useState, useEffect, useRef } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import Card from '../../Components/Card';
import Button from '../../Components/Button';
import Badge from '../../Components/Badge';
import {
    PaperAirplaneIcon,
    ChatBubbleLeftRightIcon,
    UserCircleIcon,
} from '@heroicons/react/24/outline';

export default function MessagesIndex({ availableFeraas = [], activeFeraa = null, messages = [] }) {
    const { auth } = usePage().props;
    const currentUser = auth?.user;

    const messagesEndRef = useRef(null);

    const { data, setData, post, processing, reset } = useForm({
        feraa_id: activeFeraa?.id || '',
        body: '',
    });

    useEffect(() => {
        if (activeFeraa?.id) {
            setData('feraa_id', activeFeraa.id);
        }
    }, [activeFeraa]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!data.body.trim()) return;

        post(route('messages.store'), {
            preserveScroll: true,
            onSuccess: () => reset('body'),
        });
    };

    const handleSelectFeraa = (feraaId) => {
        router.get(route('messages.index'), { feraa_id: feraaId }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout header="Fera'a Group Conversation">
            <Head title="Group Chat" />

            <div className="max-w-4xl mx-auto space-y-4">
                {/* Fera'a Tabs (if user belongs to multiple Fera'as or is admin) */}
                {availableFeraas.length > 1 && (
                    <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                        {availableFeraas.map((f) => (
                            <button
                                key={f.id}
                                onClick={() => handleSelectFeraa(f.id)}
                                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                    activeFeraa?.id === f.id
                                        ? 'bg-[#6B21A8] text-white shadow-md'
                                        : 'bg-white text-slate-700 hover:bg-purple-50 border border-slate-200'
                                }`}
                            >
                                {f.name} ({f.section?.name})
                            </button>
                        ))}
                    </div>
                )}

                {/* Chat Card */}
                <Card padding="p-0" className="border-purple-100 flex flex-col h-[600px] overflow-hidden bg-white">
                    {/* Chat Header */}
                    <div className="p-4 border-b border-purple-50 bg-[#FAF7FC] flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-2xl bg-purple-700 text-white flex items-center justify-center font-bold text-sm">
                                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900">
                                    {activeFeraa?.name || "Fera'a Channel"}
                                </h3>
                                <p className="text-[11px] text-slate-500 font-semibold">
                                    {activeFeraa?.section?.name || 'Scout Group'}
                                </p>
                            </div>
                        </div>

                        <Badge variant="feraa" size="sm">
                            Official Patrol Chat
                        </Badge>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF8FD]/40">
                        {messages && messages.length > 0 ? (
                            messages.map((msg) => {
                                const isMe = msg.user_id === currentUser?.id;
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                                    >
                                        <div className="flex items-baseline space-x-1.5 mb-1 px-1">
                                            <span className="text-[11px] font-bold text-slate-700">
                                                {isMe ? 'You' : msg.user?.full_name}
                                            </span>
                                            <span className="text-[9px] text-slate-400">
                                                {new Date(msg.created_at).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>

                                        <div
                                            className={`max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                                                isMe
                                                    ? 'bg-[#6B21A8] text-white rounded-tr-xs'
                                                    : 'bg-white border border-purple-100 text-slate-800 rounded-tl-xs'
                                            }`}
                                        >
                                            {msg.body}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
                                <ChatBubbleLeftRightIcon className="h-8 w-8 mb-2 text-purple-300" />
                                <span>No messages in this Fera'a yet. Say hello to your patrol!</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input */}
                    {activeFeraa ? (
                        <form onSubmit={handleSendMessage} className="p-3 border-t border-purple-100 bg-white flex items-center space-x-2">
                            <input
                                type="text"
                                placeholder="Type your message to the Fera'a..."
                                value={data.body}
                                onChange={(e) => setData('body', e.target.value)}
                                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
                            />
                            <Button
                                type="submit"
                                variant="primary"
                                size="md"
                                disabled={processing || !data.body.trim()}
                                className="rounded-2xl"
                            >
                                <PaperAirplaneIcon className="h-4 w-4" />
                            </Button>
                        </form>
                    ) : (
                        <div className="p-4 text-center text-xs text-slate-400 bg-slate-50">
                            You are not assigned to any Fera'a yet.
                        </div>
                    )}
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
