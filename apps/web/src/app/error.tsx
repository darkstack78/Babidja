'use client';
import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

/**
 * UX-03 : Page d'erreur globale Next.js App Router.
 * Affichée automatiquement quand une erreur non-gérée est levée dans un segment.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Ici on peut logger l'erreur vers Sentry ou autre outil de monitoring
    console.error('[Global Error]', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 grid size-20 place-items-center rounded-full bg-red-50">
        <AlertTriangle className="size-10 text-danger" aria-hidden="true" />
      </div>
      <h1 className="text-2xl font-extrabold text-gray-900">Une erreur s&apos;est produite</h1>
      <p className="mt-3 max-w-md text-gray-500">
        Nous avons rencontré un problème inattendu. Notre équipe en a été notifiée.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-gray-400">
          Code&nbsp;: {error.digest}
        </p>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-secondary-dark"
          aria-label="Réessayer de charger la page"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Réessayer
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full border border-gray-200 px-6 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
          aria-label="Retour à l'accueil"
        >
          <Home className="size-4" aria-hidden="true" />
          Accueil
        </Link>
      </div>
    </div>
  );
}
