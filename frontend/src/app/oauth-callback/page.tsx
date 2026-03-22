'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function OAuthHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    
    // In a production app, the backend should return both token and user, 
    // but we can also fetch user profile if needed.
    // For now assuming the redirect includes minimal user info or we use a fixed placeholder
    // and fetch it later.
    
    if (token) {
      // Decode user info if available in token or from redirect
      const user = { id: 1, name: 'Google User', email: 'user@gmail.com' }; 
      login(token, user);
      router.push('/');
    } else {
      router.push('/login');
    }
  }, [searchParams, login, router]);

  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a1f35_0%,_#050510_100%)] opacity-50" />
      <div className="relative text-center">
        <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-6" />
        <h1 className="text-2xl font-semibold text-white mb-2">Authenticating</h1>
        <p className="text-cyan-400/60">Establishing secure connection for KnowledgeGraphX...</p>
      </div>
    </div>
  );
}

export default function OAuthCallback() {
  return (
    <Suspense>
      <OAuthHandler />
    </Suspense>
  );
}
