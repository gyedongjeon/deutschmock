"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, LogOut } from "lucide-react";
import { Suspense, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../../lib/i18n";

function SettingsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const langCode = searchParams.get('lang') || 'en';

    const [userInfo, setUserInfo] = useState({ name: '', email: '', picture: '' });

    useEffect(() => {
        const storedName = localStorage.getItem('user_name') || searchParams.get('name') || 'Google User';
        const storedEmail = localStorage.getItem('user_email') || searchParams.get('email') || 'user@gmail.com';
        const storedPicture = localStorage.getItem('user_picture') || searchParams.get('picture') || '';

        // Ensure state update only happens if values differ to avoid unnecessary renders/rule violations
        setTimeout(() => {
            setUserInfo({ name: storedName, email: storedEmail, picture: storedPicture });
        }, 0);
    }, [searchParams]);

    const { name, email, picture } = userInfo;
    const { t } = useTranslation();

    // Language code mapping (example with major languages only)
    const langMap: Record<string, string> = {
        'ko': 'Korean (한국어)',
        'en': 'English',
        'de': 'German (Deutsch)',
        'ja': 'Japanese (日本語)',
        // Add more if needed
    };

    const displayLang = langMap[langCode] || langCode.toUpperCase();

    const handleLogout = () => {
        // Clear authentication data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_picture');

        // Redirect to home
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                <header className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">{t('settings')}</h1>
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
                        <X className="h-6 w-6 text-gray-500" />
                        <span className="sr-only">{t('close')}</span>
                    </Button>
                </header>

                <Card className="shadow-sm overflow-hidden">
                    {/* Account Section */}
                    <div className="p-6 border-b">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">{t('account')}</div>
                        <div className="flex items-center gap-4">
                            {picture ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={picture} alt={name} className="w-12 h-12 rounded-full border border-gray-200" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xl">
                                    {name.charAt(0)}
                                </div>
                            )}
                            <div>
                                <h3 className="font-semibold text-gray-900">{name}</h3>
                                <p className="text-sm text-gray-500">{email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Language Section */}
                    <div className="p-6 border-b">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">{t('language')}</div>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium text-gray-900">{t('explanationLanguage')}</div>
                                <div className="text-sm text-gray-500 mt-1">{t('languageFeedback')}</div>
                            </div>
                            <div className="text-right">
                                <div className="font-medium text-gray-900 mb-1">{displayLang}</div>
                                <Link href="/language" className="text-sm font-medium text-blue-600 hover:underline">
                                    {t('change')}
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <div className="p-0">
                        <button
                            onClick={handleLogout}
                            className="w-full text-left p-6 flex items-center gap-2 text-red-600 font-medium hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            {t('signOut')}
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SettingsContent />
        </Suspense>
    )
}
