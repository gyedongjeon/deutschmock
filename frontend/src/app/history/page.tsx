"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import "../../lib/i18n";

interface HistoryItem {
    id: number;
    created_at: string;
    score: number;
    level: string;
    part: number;
    module: string;
    original_text: string;
}

function HistoryContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const lang = searchParams.get("lang") || "en";
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { t, i18n } = useTranslation();

    useEffect(() => {
        if (lang) {
            i18n.changeLanguage(lang);
        }
    }, [lang, i18n]);

    useEffect(() => {
        const fetchHistory = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                router.push('/');
                return;
            }

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/evaluation/history`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setHistory(data);
                } else {
                    console.error("Failed to fetch history");
                }
            } catch (err) {
                console.error("Error fetching history:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [router]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(lang === 'ko' ? 'ko-KR' : lang === 'de' ? 'de-DE' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-gray-50 p-4">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <header className="flex items-center justify-between py-4">
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Clock className="w-6 h-6 text-blue-600" />
                        {t('historyTitle')}
                    </h1>
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
                        <ArrowLeft className="h-6 w-6 text-gray-500" />
                    </Button>
                </header>

                {/* List */}
                <div className="space-y-4">
                    {history.length === 0 ? (
                        <Card className="p-8 text-center text-gray-500 bg-white shadow-sm">
                            <p className="mb-4">{t('noHistory')}</p>
                            <Link href={`/test?lang=${lang}`}>
                                <Button>{t('startTest')}</Button>
                            </Link>
                        </Card>
                    ) : (
                        history.map((item) => (
                            <Link href={`/history/${item.id}?lang=${lang}`} key={item.id} className="block">
                                <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300">
                                    <CardContent className="p-0">
                                        <div className="flex items-center justify-between p-4 bg-white">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{formatDate(item.created_at)}</span>
                                                </div>
                                                <div className="font-semibold text-gray-900">
                                                    {item.level} - {t('part')} {item.part} ({item.module || 'writing'})
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className={`text-xl font-bold ${item.score >= 60 ? 'text-green-600' : 'text-amber-600'}`}>
                                                    {item.score}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 px-4 py-2 text-xs text-blue-600 font-medium text-right hover:underline">
                                            {t('viewDetails')} →
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default function HistoryPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HistoryContent />
        </Suspense>
    );
}
