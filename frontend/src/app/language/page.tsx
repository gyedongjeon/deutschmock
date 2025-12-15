"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const languages = [
    { code: 'ar', name: 'Arabic', native: 'العربية' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'bg', name: 'Bulgarian', native: 'Български' },
    { code: 'zh', name: 'Chinese (Simplified)', native: '简体中文' },
    { code: 'zh-TW', name: 'Chinese (Traditional)', native: '繁體中文' },
    { code: 'hr', name: 'Croatian', native: 'Hrvatski' },
    { code: 'cs', name: 'Czech', native: 'Čeština' },
    { code: 'da', name: 'Danish', native: 'Dansk' },
    { code: 'nl', name: 'Dutch', native: 'Nederlands' },
    { code: 'en', name: 'English', native: 'English' },
    { code: 'et', name: 'Estonian', native: 'Eesti' },
    { code: 'fi', name: 'Finnish', native: 'Suomi' },
    { code: 'fr', name: 'French', native: 'Français' },
    { code: 'de', name: 'German', native: 'Deutsch' },
    { code: 'el', name: 'Greek', native: 'Ελληνικά' },
    { code: 'he', name: 'Hebrew', native: 'עברית' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'hu', name: 'Hungarian', native: 'Magyar' },
    { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
    { code: 'it', name: 'Italian', native: 'Italiano' },
    { code: 'ja', name: 'Japanese', native: '日本語' },
    { code: 'ko', name: 'Korean', native: '한국어' },
    { code: 'lv', name: 'Latvian', native: 'Latviešu' },
    { code: 'lt', name: 'Lithuanian', native: 'Lietuvių' },
    { code: 'no', name: 'Norwegian', native: 'Norsk' },
    { code: 'pl', name: 'Polish', native: 'Polski' },
    { code: 'pt', name: 'Portuguese', native: 'Português' },
    { code: 'ro', name: 'Romanian', native: 'Română' },
    { code: 'ru', name: 'Russian', native: 'Русский' },
    { code: 'sr', name: 'Serbian', native: 'Српски' },
    { code: 'sk', name: 'Slovak', native: 'Slovenčina' },
    { code: 'sl', name: 'Slovenian', native: 'Slovenščina' },
    { code: 'es', name: 'Spanish', native: 'Español' },
    { code: 'sw', name: 'Swahili', native: 'Kiswahili' },
    { code: 'sv', name: 'Swedish', native: 'Svenska' },
    { code: 'th', name: 'Thai', native: 'ไทย' },
    { code: 'tr', name: 'Turkish', native: 'Türkçe' },
    { code: 'uk', name: 'Ukrainian', native: 'Українська' },
    { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' }
];

export default function LanguagePage() {
    const [search, setSearch] = useState("");
    const router = useRouter();

    const filteredLanguages = languages.filter(
        (lang) =>
            lang.name.toLowerCase().includes(search.toLowerCase()) ||
            lang.native.toLowerCase().includes(search.toLowerCase()) ||
            lang.code.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = async (code: string) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            try {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/language`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ language: code })
                });
            } catch (error) {
                console.error("Failed to update language", error);
            }
            // Update local storage for immediate UI feedback
            localStorage.setItem('user_language', code);
        }
        router.push(`/test?lang=${code}`);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-lg h-[600px] flex flex-col">
                <CardHeader>
                    <CardTitle>Select Language</CardTitle>
                    <CardDescription>Choose your native language for better assistance.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col overflow-hidden">
                    <div className="relative mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <Input
                            placeholder="Search language..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {filteredLanguages.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                No language found.
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filteredLanguages.map((lang) => (
                                    <Button
                                        key={lang.code}
                                        variant="ghost"
                                        className="w-full justify-between h-14 font-normal hover:bg-zinc-100"
                                        onClick={() => handleSelect(lang.code)}
                                    >
                                        <span className="text-base font-medium">{lang.name}</span>
                                        <span className="text-sm text-muted-foreground font-normal">{lang.native}</span>
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #e4e4e7;
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background-color: transparent;
        }
      `}</style>
        </div>
    );
}
