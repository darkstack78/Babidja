'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { exchangeOAuthCode } from '@/lib/api/auth';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    const code = searchParams.get('code');

    if (!code) {
      router.replace('/');
      return;
    }

    exchangeOAuthCode(code)
      .then((data) => {
        setSession({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user });
        router.replace('/');
      })
      .catch((error) => {
        console.error('Erreur lors de la connexion Google', error);
        router.replace('/');
      });
  }, [searchParams, router, setSession]);

  return (
    <div className="grid min-h-screen place-items-center">
      <p className="text-sm text-gray-500">Connexion en cours...</p>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center" />}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
