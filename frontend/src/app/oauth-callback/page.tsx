'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api/auth';

function OAuthHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuth = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setError('No authentication token received.');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      try {
        // Store token first so the axios interceptor can use it
        localStorage.setItem('token', token);

        // Fetch real user data from backend using the JWT
        const userData = await authApi.getMe();

        // Complete login with real user data
        login(token, userData);
      } catch (err) {
        console.error('OAuth callback error:', err);
        localStorage.removeItem('token');
        setError('Authentication failed. Redirecting to login...');
        setTimeout(() => router.push('/login'), 2000);
      }
    };

    handleOAuth();
  }, [searchParams, login, router]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[140px] rounded-full animate-pulse-slow" />
      </div>
      <div className="relative text-center space-y-6">
        {error ? (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-red-400">{error}</h1>
          </>
        ) : (
          <>
            <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin mx-auto" />
            <h1 className="text-2xl font-bold text-zinc-100">Authenticating</h1>
            <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest">
              Establishing secure neural link...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function OAuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    }>
      <OAuthHandler />
    </Suspense>
  );
}
