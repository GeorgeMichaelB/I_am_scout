import React from 'react';
import Logo from '../Components/Logo';
import FlashMessage from '../Components/FlashMessage';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen bg-radial from-[#F5F0EB] via-[#FAF5FF] to-[#EDE9FE] flex flex-col justify-center items-center p-4 sm:p-6">
            <FlashMessage />
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center mb-6 text-center">
                    <img
                        src="/images/logo.jpg"
                        alt="I'm Scout"
                        className="h-20 w-auto object-contain drop-shadow-md mb-2 transition-transform hover:scale-105"
                    />
                    <h1 className="text-2xl font-black tracking-tight text-scout-900">
                        I'm Scout
                    </h1>
                    <p className="text-xs uppercase font-bold tracking-widest text-scout-600 mt-0.5">
                        مجموعة مارمرقس الكشفية الجوية
                    </p>
                </div>
                {children}
            </div>
        </div>
    );
}

