'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const name = searchParams.get('name');
        const email = searchParams.get('email');
        const picture = searchParams.get('picture');
        const language = searchParams.get('language');

        if (token) {
            // Store token in localStorage
            localStorage.setItem('auth_token', token);

            // Store user info briefly for display (or decode JWT)
            if (name) localStorage.setItem('user_name', name);
            if (email) localStorage.setItem('user_email', email);
            if (picture) localStorage.setItem('user_picture', picture);
            if (language) localStorage.setItem('user_language', language);

            // Redirect to homepage or settings
            router.push('/');
        } else {
            // Error handling
            router.push('/');
        }
    }, [router, searchParams]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Logging in...</h2>
                <p className="text-gray-500">Please wait while we redirect you.</p>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CallbackContent />
        </Suspense>
    )
}
