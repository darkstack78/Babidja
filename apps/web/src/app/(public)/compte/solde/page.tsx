'use client';

import { useState } from 'react';
import { Wallet, X, AlertCircle, History } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { fcfa } from '@/utils/formatters';
import { useQuery } from '@tanstack/react-query';
import { fetchMyBookings } from '@/lib/api/bookings';
import type { Booking } from '@/types/booking';

const AMOUNTS = [5000, 10000, 25000, 50000, 100000];

export default function Solde() {
  const { user } = useAuthStore();
  const balance = user?.walletBalance ?? 0;
  const [showRecharge, setShowRecharge] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [amount, setAmount] = useState<number | null>(null);
  const [custom, setCustom] = useState('');

  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ['my-bookings'],
    queryFn: fetchMyBookings,
    enabled: showHistory,
  });

  // Historique = réservations payées (CONFIRMED ou COMPLETED)
  const paidBookings = (bookings as Booking[]).filter(
    (b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED',
  );

  const selectedAmount = custom ? Number(custom) : amount;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
      <h1 className="text-2xl font-extrabold mb-6">Mon solde</h1>

      <section className="flex max-w-sm mx-auto flex-col items-center rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
        <span className="grid size-16 place-items-center rounded-2xl bg-pastel">
          <Wallet className="size-8 text-secondary" />
        </span>
        <p className="mt-4 text-gray-500 font-semibold uppercase text-sm">Solde actuel</p>
        <p className="mt-1 text-4xl font-extrabold text-primary">{fcfa(balance)}</p>
        <Button className="mt-6 w-full py-3" onClick={() => setShowRecharge(true)}>
          Recharger mon compte
        </Button>
        <Button
          variant="secondary"
          className="mt-3 w-full py-3"
          onClick={() => setShowHistory(true)}
        >
          <History className="size-4" /> Voir l&apos;historique des transactions
        </Button>
      </section>

      {/* ─── Modal Recharge ─── */}
      {showRecharge && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
          onClick={(e) => { if (e.target === e.currentTarget) setShowRecharge(false); }}
        >
          <div className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-extrabold">Recharger mon solde</h2>
              <button onClick={() => setShowRecharge(false)} className="rounded-full p-1.5 hover:bg-gray-100">
                <X className="size-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">Choisissez ou saisissez un montant à ajouter à votre solde.</p>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {AMOUNTS.map((a) => (
                <button
                  key={a}
                  onClick={() => { setAmount(a); setCustom(''); }}
                  className={`rounded-2xl border-2 py-2.5 text-sm font-bold transition-all ${
                    amount === a && !custom
                      ? 'border-[#e97c2a] bg-orange-50 text-[#e97c2a]'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {fcfa(a)}
                </button>
              ))}
            </div>

            <input
              type="number"
              placeholder="Autre montant (FCFA)"
              value={custom}
              onChange={(e) => { setCustom(e.target.value); setAmount(null); }}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-[#e97c2a] focus:ring-2 focus:ring-orange-100"
            />

            <div className="mt-2 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700">
              <AlertCircle className="size-4 mt-0.5 shrink-0" />
              La recharge de solde par paiement en ligne (CinetPay) sera disponible prochainement.
            </div>

            <Button
              size="lg"
              className="mt-4 w-full"
              disabled={!selectedAmount || selectedAmount <= 0}
              onClick={() => setShowRecharge(false)}
            >
              Continuer — {selectedAmount ? fcfa(selectedAmount) : 'Choisir un montant'}
            </Button>
          </div>
        </div>
      )}

      {/* ─── Modal Historique ─── */}
      {showHistory && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
          onClick={(e) => { if (e.target === e.currentTarget) setShowHistory(false); }}
        >
          <div className="w-full max-w-lg rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-extrabold">Historique des transactions</h2>
              <button onClick={() => setShowHistory(false)} className="rounded-full p-1.5 hover:bg-gray-100">
                <X className="size-5" />
              </button>
            </div>

            {paidBookings.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">Aucune transaction pour le moment.</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
                {paidBookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold">Réservation {b.bookingRef}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(b.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <p className="font-bold text-[#1a7a4c]">−{fcfa(Number(b.depositAmount))}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
