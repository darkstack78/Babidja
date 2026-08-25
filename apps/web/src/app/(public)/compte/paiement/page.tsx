'use client';

import { useEffect, useState } from 'react';
import { Star, Trash2, Plus, X, Loader2, AlertCircle, CreditCard } from 'lucide-react';
import PaymentLogo from '@/components/PaymentLogo';
import Button from '@/components/ui/Button';
import {
  getSavedPaymentMethods,
  addSavedPaymentMethod,
  deleteSavedPaymentMethod,
  type SavedPaymentMethod,
  type PaymentMethodCode,
} from '@/lib/api/payments';

// Labels affichés pour chaque provider
const PROVIDER_META: Record<PaymentMethodCode, { label: string; sub: string; logo: string }> = {
  MTN:    { label: 'Mobile Money', sub: 'MTN Mobile Money', logo: 'mtn' },
  ORANGE: { label: 'Mobile Money', sub: 'Orange Money',     logo: 'orange' },
  MOOV:   { label: 'Mobile Money', sub: 'Moov Money',       logo: 'moov' },
  WAVE:   { label: 'Mobile Money', sub: 'Wave',             logo: 'wave' },
  CARD:   { label: 'Carte bancaire', sub: 'Visa / Mastercard', logo: 'mastercard' },
};

const ALL_PROVIDERS: PaymentMethodCode[] = ['MTN', 'ORANGE', 'MOOV', 'WAVE', 'CARD'];

// Clé localStorage pour le favori
const FAVORITE_KEY = 'babydja_favorite_payment_method';

// ─── Composant toast léger ────────────────────────────────────────────────────
function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-xl transition-all animate-slide-up ${
        type === 'success' ? 'bg-[#1a7a4c]' : 'bg-[#c0392b]'
      }`}
    >
      {type === 'error' && <AlertCircle className="size-4 shrink-0" />}
      {message}
    </div>
  );
}

// ─── Modale d'ajout ───────────────────────────────────────────────────────────
interface AddModalProps {
  onClose: () => void;
  onAdded: (method: SavedPaymentMethod) => void;
}

function AddModal({ onClose, onAdded }: AddModalProps) {
  const [provider, setProvider] = useState<PaymentMethodCode>('MTN');
  const [tokenizedRef, setTokenizedRef] = useState('');
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!tokenizedRef.trim()) {
      setError('Veuillez entrer un numéro ou une référence.');
      return;
    }
    setLoading(true);
    try {
      const created = await addSavedPaymentMethod({
        provider,
        tokenizedRef: tokenizedRef.trim(),
        label: label.trim() || undefined,
      });
      onAdded(created);
      onClose();
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  const meta = PROVIDER_META[provider];

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
        {/* En-tête */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">Ajouter un moyen de paiement</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-gray-100 transition-colors">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Sélection du provider */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Type de paiement
            </p>
            <div className="grid grid-cols-5 gap-2">
              {ALL_PROVIDERS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setProvider(p)}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 p-2 transition-all ${
                    provider === p
                      ? 'border-[#e97c2a] bg-orange-50'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span className="grid h-9 w-12 place-items-center overflow-hidden rounded-xl border border-gray-100 bg-white">
                    <PaymentLogo method={PROVIDER_META[p].logo} className="h-7 w-11" />
                  </span>
                  <span className="text-[9px] font-semibold leading-tight text-gray-600 text-center">
                    {p === 'CARD' ? 'Carte' : p}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Aperçu sélection */}
          <div className="flex items-center gap-3 rounded-2xl bg-orange-50 px-4 py-3">
            <span className="grid h-10 w-14 place-items-center overflow-hidden rounded-xl border border-gray-100 bg-white">
              <PaymentLogo method={meta.logo} className="h-8 w-12" />
            </span>
            <div>
              <p className="text-sm font-bold">{meta.sub}</p>
              <p className="text-xs text-gray-500">{meta.label}</p>
            </div>
          </div>

          {/* Numéro / référence */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              {provider === 'CARD' ? 'Référence carte (tokenisée)' : 'Numéro de téléphone'}
            </label>
            <input
              type="text"
              value={tokenizedRef}
              onChange={(e) => setTokenizedRef(e.target.value)}
              placeholder={provider === 'CARD' ? 'ex : tok_xxxx_yyyy' : '+225 07 00 00 00'}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium outline-none transition-all focus:border-[#e97c2a] focus:bg-white focus:ring-2 focus:ring-orange-100"
            />
          </div>

          {/* Libellé optionnel */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Libellé (optionnel)
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={`ex : Mon ${meta.sub}`}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium outline-none transition-all focus:border-[#e97c2a] focus:bg-white focus:ring-2 focus:ring-orange-100"
            />
          </div>

          {/* Erreur */}
          {error && (
            <p className="flex items-center gap-1.5 text-sm text-red-600 font-medium">
              <AlertCircle className="size-4 shrink-0" /> {error}
            </p>
          )}

          {/* Bouton de validation */}
          <Button type="submit" size="lg" className="mt-1 w-full" disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {loading ? 'Enregistrement…' : 'Enregistrer ce moyen'}
          </Button>
        </form>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function PaymentMethods() {
  const [methods, setMethods] = useState<SavedPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Chargement initial + validation du favori persisté
  useEffect(() => {
    const stored = localStorage.getItem(FAVORITE_KEY);

    getSavedPaymentMethods()
      .then((data) => {
        setMethods(data);
        // Valider que le favori mémorisé appartient bien à un moyen
        // de cet utilisateur — le nettoyer sinon (session précédente).
        if (stored) {
          const valid = data.some((m) => m.id === stored);
          if (valid) {
            setFavoriteId(stored);
          } else {
            localStorage.removeItem(FAVORITE_KEY);
          }
        }
      })
      .catch(() => setError("Impossible de charger vos moyens de paiement."))
      .finally(() => setLoading(false));
  }, []);

  // Affiche un toast pendant 3 secondes
  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  // Définir / retirer un favori (persisté en localStorage)
  function toggleFavorite(id: string) {
    const next = favoriteId === id ? null : id;
    setFavoriteId(next);
    if (next) {
      localStorage.setItem(FAVORITE_KEY, next);
      showToast('Moyen de paiement défini comme favori.', 'success');
    } else {
      localStorage.removeItem(FAVORITE_KEY);
      showToast('Favori retiré.', 'success');
    }
  }

  // Suppression avec optimistic UI
  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteSavedPaymentMethod(id);
      setMethods((prev) => prev.filter((m) => m.id !== id));
      // Nettoyer le favori si c'est celui supprimé
      if (favoriteId === id) {
        setFavoriteId(null);
        localStorage.removeItem(FAVORITE_KEY);
      }
      showToast('Moyen de paiement supprimé.', 'success');
    } catch {
      showToast("Impossible de supprimer ce moyen de paiement.", 'error');
    } finally {
      setDeletingId(null);
    }
  }

  // Ajout depuis la modale
  function handleAdded(method: SavedPaymentMethod) {
    setMethods((prev) => [...prev, method]);
    showToast('Moyen de paiement ajouté !', 'success');
  }

  // ── Rendu ──
  return (
    <>
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-extrabold">Moyens de paiement</h1>

        {/* État de chargement */}
        {loading && (
          <div className="mt-8 flex flex-col items-center gap-3 text-gray-400">
            <Loader2 className="size-8 animate-spin text-[#e97c2a]" />
            <p className="text-sm">Chargement…</p>
          </div>
        )}

        {/* Erreur de chargement */}
        {!loading && error && (
          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-600 font-medium">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Liste vide */}
        {!loading && !error && methods.length === 0 && (
          <div className="mt-8 flex flex-col items-center gap-3 text-gray-400">
            <CreditCard className="size-12 text-gray-200" />
            <p className="text-sm font-medium">Aucun moyen de paiement enregistré.</p>
            <p className="text-xs text-gray-300">Ajoutez-en un ci-dessous.</p>
          </div>
        )}

        {/* Liste des moyens */}
        {!loading && !error && methods.length > 0 && (
          <div className="mt-5 flex flex-col gap-4">
            {methods.map((m) => {
              const meta = PROVIDER_META[m.provider] ?? {
                label: m.provider,
                sub: m.label ?? m.tokenizedRef,
                logo: 'bank',
              };
              const isFav = favoriteId === m.id;
              const isDeleting = deletingId === m.id;

              return (
                <article
                  key={m.id}
                  className={`rounded-2xl border p-4 transition-all ${
                    isFav ? 'border-[#e97c2a] bg-orange-50/40' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-gray-700">{meta.label}</p>
                    {isFav && (
                      <span className="rounded-full bg-[#e97c2a] px-2 py-0.5 text-[10px] font-bold text-white">
                        Favori
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <span className="grid h-12 w-16 place-items-center overflow-hidden rounded-xl border border-gray-100 bg-white">
                      <PaymentLogo method={meta.logo} className="h-9 w-14" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{m.label ?? meta.sub}</p>
                      <p className="text-sm text-gray-500">{m.tokenizedRef}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {/* Bouton favori */}
                    <Button
                      variant={isFav ? 'outlineOrange' : 'outline'}
                      size="sm"
                      onClick={() => toggleFavorite(m.id)}
                    >
                      <Star className={`size-4 ${isFav ? 'fill-[#e97c2a] text-[#e97c2a]' : ''}`} />
                      {isFav ? 'Favori' : 'Définir comme favori'}
                    </Button>

                    {/* Bouton suppression */}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(m.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting
                        ? <Loader2 className="size-4 animate-spin" />
                        : <Trash2 className="size-4" />}
                      {isDeleting ? 'Suppression…' : 'Supprimer'}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Bouton d'ajout */}
        {!loading && !error && (
          <Button
            size="lg"
            className="mt-6 w-full"
            onClick={() => setShowModal(true)}
          >
            <Plus className="size-4" /> Ajouter un nouveau moyen de paiement
          </Button>
        )}
      </div>

      {/* Modale d'ajout */}
      {showModal && (
        <AddModal
          onClose={() => setShowModal(false)}
          onAdded={handleAdded}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Animation slide-up pour le toast */}
      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.25s ease-out both; }
      `}</style>
    </>
  );
}
