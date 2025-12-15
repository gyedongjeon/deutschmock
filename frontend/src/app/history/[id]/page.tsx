"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, CheckCircle2, Award } from "lucide-react";
import { useTranslation } from "react-i18next";
import "../../../lib/i18n";

interface Feedback {
    strengths: string[];
    improvements: string[];
    corrected: string;
}

interface EvaluationResult {
    id: number;
    score: number;
    feedback: Feedback;
    original_text: string;
    level: string;
    part: number;
    module: string;
    created_at: string;
    task: {
        title: string;
        scenario: string;
    };
}

function HistoryDetailContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const lang = searchParams.get("lang") || "en";
    const [result, setResult] = useState<EvaluationResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t, i18n } = useTranslation();

    useEffect(() => {
        if (lang) {
            i18n.changeLanguage(lang);
        }
    }, [lang, i18n]);

    useEffect(() => {
        const fetchDetail = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                router.push('/');
                return;
            }

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/evaluation/history/${params.id}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setResult(data);
                } else {
                    setError("Failed to load evaluation details.");
                }
            } catch (err) {
                setError("An error occurred.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchDetail();
        }
    }, [params.id, router]);

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

    if (error || !result) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <p className="text-red-500 mb-4">{error || "Result not found"}</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-gray-50 p-4">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <header className="flex items-center justify-between py-4">
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        {t('evaluation')}
                    </h1>
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
                        <ArrowLeft className="h-6 w-6 text-gray-500" />
                    </Button>
                </header>

                {/* Score Card */}
                <Card className="border-green-200 bg-green-50/50 overflow-hidden shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(result.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-2 font-medium text-gray-900">
                                <Award className="w-4 h-4 text-blue-600" />
                                <span>{result.level} - {t('part')} {result.part}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{result.task?.title}</div>
                        </div>
                        <div className={`text-4xl font-bold ${result.score >= 60 ? 'text-green-600' : 'text-amber-600'}`}>
                            {result.score} <span className="text-sm text-gray-500 font-normal">/ 100</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Task Details */}
                {result.task && (
                    <Card className="shadow-sm border-blue-100">
                        <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50/50">
                            <CardTitle className="text-base text-gray-900 font-semibold">
                                Task: {result.task.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                                {result.task.scenario}
                            </p>

                            {/* Check if task has points and rendering them */}
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {Array.isArray((result.task as any).points) && (result.task as any).points.length > 0 && (
                                <ul className="space-y-2">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {(result.task as any).points.map((point: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                            <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Feedback */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <CheckCircle2 className="w-5 h-5 text-blue-600" />
                            {t('correction')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Original Text */}
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">My Answer</p>
                            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{result.original_text}</p>
                        </div>

                        {/* Strengths */}
                        {result.feedback.strengths && result.feedback.strengths.length > 0 && (
                            <div>
                                <p className="font-medium text-blue-800 mb-2">{t('strengths')}</p>
                                <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
                                    {result.feedback.strengths.map((str, idx) => (
                                        <li key={idx}>{str}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Improvements */}
                        {result.feedback.improvements && result.feedback.improvements.length > 0 && (
                            <div>
                                <p className="font-medium text-amber-800 mb-2">{t('improvements')}</p>
                                <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
                                    {result.feedback.improvements.map((imp, idx) => (
                                        <li key={idx}>{imp}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Corrected Version */}
                        {result.feedback.corrected && (
                            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                                <p className="font-semibold text-gray-900 mb-2">{t('corrected')}</p>
                                <p className="text-sm text-gray-800 italic leading-relaxed">&quot;{result.feedback.corrected}&quot;</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function HistoryDetailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HistoryDetailContent />
        </Suspense>
    );
}
