"use client";

import { useState, useRef, Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Settings, CheckCircle2, RefreshCw, Menu, LogOut, Clock, ArrowLeft } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import "../../lib/i18n";

interface Feedback {
    strengths: string[];
    improvements: string[];
    corrected: string;
}

interface EvaluationResult {
    score: number;
    feedback: Feedback;
}


function TestContent() {
    const searchParams = useSearchParams();
    const lang = searchParams.get("lang") || "en";
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState<EvaluationResult | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [task, setTask] = useState<any>(null); // Keeping any for now, but explicit is better
    const [level, setLevel] = useState("A2");
    const [part, setPart] = useState(1); // Task Part State
    const [isTaskLoading, setIsTaskLoading] = useState(false);
    const [usageInfo, setUsageInfo] = useState<{ count: number; limit: number } | null>(null);
    const resultRef = useRef<HTMLDivElement>(null);

    // Number of parts for each level
    const LEVEL_PARTS: Record<string, number> = {
        'A1': 1, // Only one free-text task effectively
        'A2': 2,
        'B1': 3,
        'B2': 2,
        'C1': 2
    };

    // Initialize i18n hook
    const { t, i18n } = useTranslation();

    // Update language when url param changes
    useEffect(() => {
        if (lang) {
            i18n.changeLanguage(lang);
        }
    }, [lang, i18n]);

    const fetchTask = async (selectedLevel: string, selectedPart: number) => {
        setIsTaskLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const headers: Record<string, string> = {};
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/evaluation/task?level=${selectedLevel}&part=${selectedPart}`, { headers });
            if (res.ok) {
                const data = await res.json();
                setTask(data);
                setInput("");
                setShowResult(false);
                setResult(null);
            } else {
                console.error("Failed to fetch task");
            }
        } catch (err) {
            console.error("Error fetching task:", err);
        } finally {
            setIsTaskLoading(false);
        }
    };

    const fetchUserProfile = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const user = await res.json();
                if (user.level) {
                    setLevel(user.level);
                }
                if (typeof user.usage_count === 'number' && typeof user.usage_limit === 'number') {
                    setUsageInfo({ count: user.usage_count, limit: user.usage_limit });
                }
            }
        } catch (err) {
            console.error("Error fetching profile:", err);
        }
    };

    // Load User Profile (Level & Usage) on Mount
    useEffect(() => {
        fetchUserProfile();
    }, []);

    // Fetch Task when Level or Part changes
    useEffect(() => {
        fetchTask(level, part);
    }, [level, part]);

    const handleLevelChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLevel = e.target.value;
        setLevel(newLevel);
        setPart(1);

        // Save new level to DB
        const token = localStorage.getItem('auth_token');
        if (token) {
            try {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/level`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ level: newLevel })
                });
            } catch (err) {
                console.error("Failed to update user level:", err);
            }
        }
    };

    const handlePartChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPart(parseInt(e.target.value));
    };

    const handleRefreshTask = () => {
        fetchTask(level, part);
    };

    const handleSubmit = async () => {
        if (!input.trim()) {
            alert(t('alertEmpty'));
            return;
        }

        if (usageInfo && usageInfo.count >= usageInfo.limit) {
            alert("Trial limit reached! Please contact support to upgrade.");
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('auth_token');
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            // Ensure task object has the current level/part
            const taskWithContext = { ...task, level, part };

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/evaluation`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    answer: input,
                    task: taskWithContext
                }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                if (response.status === 403) {
                    throw new Error(errData.message || "Trial limit reached");
                }
                throw new Error("Evaluation failed");
            }

            const data = await response.json();
            setResult(data);
            setShowResult(true);

            // Refresh usage info after successful submission
            fetchUserProfile();

            // Scroll to result
            setTimeout(() => {
                resultRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);

        } catch (error: any) {
            console.error(error);
            alert(error.message || t('alertError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-50 p-4 pb-20">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-gray-900">{t('title')}</h1>
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                BETA
                            </span>
                        </div>
                        <p className="text-sm text-gray-500">{t('subtitle')}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        {usageInfo !== null && (
                            <div className={`px-3 py-2 text-sm font-medium rounded-md border ${usageInfo.count >= usageInfo.limit ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-gray-600 border-gray-300'}`}>
                                Trials: {usageInfo.count}/{usageInfo.limit}
                            </div>
                        )}
                        <select
                            value={level}
                            onChange={handleLevelChange}
                            className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {Object.keys(LEVEL_PARTS).map((l) => (
                                <option key={l} value={l}>{l} {t('level')}</option>
                            ))}
                        </select>

                        <select
                            value={part}
                            onChange={handlePartChange}
                            className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {Array.from({ length: LEVEL_PARTS[level] || 1 }, (_, i) => i + 1).map((p) => (
                                <option key={p} value={p}>{t('part')} {p}</option>
                            ))}
                        </select>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <Menu className="h-6 w-6 text-gray-600" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <DropdownMenuLabel>Menu</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/" className="cursor-pointer">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        <span>Back to Home</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/history?lang=${lang}`} className="cursor-pointer">
                                        <Clock className="mr-2 h-4 w-4" />
                                        <span>Exam History</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/settings?lang=${lang}`} className="cursor-pointer">
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600 cursor-pointer"
                                    onClick={() => {
                                        localStorage.removeItem('auth_token');
                                        localStorage.removeItem('user_name');
                                        localStorage.removeItem('user_email');
                                        localStorage.removeItem('user_picture');
                                        window.location.href = '/';
                                    }}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Sign out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Task Card */}
                <Card className="shadow-lg border border-gray-200 relative">
                    {isTaskLoading && (
                        <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-lg">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    )}
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <div className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
                                {task ? `${task.level || level} - ${t('part')} ${task.part || part}: ${task.title}` : t('loadingTask')}
                            </div>
                            <p className="text-lg font-medium leading-relaxed text-gray-800 pr-8">
                                {task ? task.scenario : t('waiting')}
                            </p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleRefreshTask} title={t('newTask')}>
                            <RefreshCw className="h-5 w-5 text-gray-400 hover:text-blue-600" />
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                        {task && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-2 rounded-md border border-gray-100 mb-4">
                                <span className="font-medium text-blue-600">{t('time')}:</span>
                                <span>{task.time || "N/A"}</span>
                            </div>
                        )}

                        {task && task.points && (
                            <ul className="space-y-3">
                                {task.points.map((item: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-3 relative pl-2">
                                        <span className="absolute left-0 top-2 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                                        <span className="text-gray-700 leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="text-sm text-gray-500 border-t pt-4">
                            {task ? task.instruction : t('waiting')}
                        </div>

                        <Textarea
                            placeholder={t('placeholder')}
                            className="min-h-[200px] text-base p-4 resize-y bg-white"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />

                        <Button
                            className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 transition-all"
                            onClick={handleSubmit}
                            disabled={loading || isTaskLoading}
                        >
                            {loading ? t('submitting') : t('submit')}
                        </Button>
                    </CardContent>
                </Card>

                {/* Result Area */}
                {showResult && result && (
                    <div ref={resultRef} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="border-green-200 bg-green-50/50 overflow-hidden shadow-lg">
                            <CardContent className="p-0">
                                <div className="flex items-center justify-between bg-green-50 border-b border-green-200 p-6">
                                    <span className="text-lg font-semibold text-green-800">{t('evaluation')}</span>
                                    <span className={`text-3xl font-bold ${result.score >= 60 ? 'text-green-600' : 'text-amber-600'}`}>{result.score} / 100</span>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        {t('correction')}
                                    </div>

                                    <div className="bg-white rounded-lg p-5 border-l-4 border-blue-500 shadow-sm space-y-4 relative">
                                        {!localStorage.getItem('auth_token') && (
                                            <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center rounded-lg">
                                                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-sm">
                                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{t('loginRequiredTitle')}</h3>
                                                    <p className="text-sm text-gray-600 mb-4">{t('loginRequiredMessage')}</p>
                                                    <a href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`} className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                                                        {t('loginToView')}
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        {/* Strengths */}
                                        {result.feedback.strengths && result.feedback.strengths.length > 0 && (
                                            <div>
                                                <p className="font-medium text-blue-800 mb-1">{t('strengths')}</p>
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
                                                <p className="font-medium text-amber-800 mb-1">{t('improvements')}</p>
                                                <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
                                                    {result.feedback.improvements.map((imp, idx) => (
                                                        <li key={idx}>{imp}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Corrected Version */}
                                        {result.feedback.corrected && (
                                            <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-100">
                                                <p className="font-semibold text-gray-900 mb-1 text-sm">{t('corrected')}</p>
                                                <p className="text-sm text-gray-800 italic leading-relaxed">&quot;{result.feedback.corrected}&quot;</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setShowResult(false);
                                                setResult(null);
                                                fetchTask(level, part);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="w-full border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800"
                                        >
                                            {t('retry')}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function TestPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <TestContent />
        </Suspense>
    );
}
