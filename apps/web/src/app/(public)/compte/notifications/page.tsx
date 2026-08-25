'use client';

import { Bell, CheckCheck, Info, AlertCircle, ShoppingBag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchMyBookings } from '@/lib/api/bookings';

const NOTIF_ICON: Record<string, React.ElementType> = {
  booking: ShoppingBag,
  info: Info,
  alert: AlertCircle,
};

/** Génère des notifications contextuelles à partir des vraies réservations du compte. */
function buildNotifications(bookings: { id: string; status: string; bookingRef: string; startDate: string }[]) {
  const notifs: { id: string; icon: React.ElementType; color: string; title: string; body: string; date: string; read: boolean }[] = [];

  bookings.forEach((b) => {
    const date = new Date(b.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    if (b.status === 'CONFIRMED') {
      notifs.push({
        id: `conf-${b.id}`,
        icon: ShoppingBag,
        color: 'text-[#1a7a4c] bg-green-50',
        title: 'Réservation confirmée',
        body: `Votre réservation ${b.bookingRef} est confirmée pour le ${date}.`,
        date,
        read: false,
      });
    } else if (b.status === 'PENDING') {
      notifs.push({
        id: `pend-${b.id}`,
        icon: Info,
        color: 'text-[#e97c2a] bg-orange-50',
        title: 'Paiement en attente',
        body: `Votre réservation ${b.bookingRef} est en attente de paiement.`,
        date,
        read: true,
      });
    } else if (b.status === 'CANCELLED') {
      notifs.push({
        id: `canc-${b.id}`,
        icon: AlertCircle,
        color: 'text-red-600 bg-red-50',
        title: 'Réservation annulée',
        body: `Votre réservation ${b.bookingRef} a été annulée.`,
        date,
        read: true,
      });
    }
  });

  return notifs;
}

export default function Notifications() {
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: fetchMyBookings,
  });

  const notifications = buildNotifications(bookings as Parameters<typeof buildNotifications>[0]);

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Notifications</h1>
        {unread > 0 && (
          <span className="rounded-full bg-[#e97c2a] px-3 py-1 text-xs font-bold text-white">
            {unread} nouvelle{unread > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {isLoading && (
        <div className="mt-8 flex justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#e97c2a]" />
        </div>
      )}

      {!isLoading && notifications.length === 0 && (
        <div className="mt-12 flex flex-col items-center gap-3 text-gray-400">
          <Bell className="size-14 text-gray-200" />
          <p className="font-medium text-gray-600">Aucune notification</p>
          <p className="text-sm text-gray-400">Vos notifications apparaîtront ici.</p>
        </div>
      )}

      {!isLoading && notifications.length > 0 && (
        <div className="mt-5 flex flex-col gap-3">
          {notifications.map((n) => {
            const Icon = n.icon;
            return (
              <div
                key={n.id}
                className={`flex items-start gap-4 rounded-2xl border p-4 transition-all ${
                  n.read ? 'border-gray-100 bg-white' : 'border-orange-100 bg-orange-50/30'
                }`}
              >
                <span className={`grid size-10 shrink-0 place-items-center rounded-xl text-sm font-bold ${n.color}`}>
                  <Icon className="size-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold">{n.title}</p>
                    {!n.read && (
                      <span className="size-2 shrink-0 mt-1.5 rounded-full bg-[#e97c2a]" />
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-gray-600">{n.body}</p>
                  <p className="mt-1 text-xs text-gray-400">{n.date}</p>
                </div>
              </div>
            );
          })}

          <button className="mt-2 flex items-center gap-2 self-end text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors">
            <CheckCheck className="size-4" /> Tout marquer comme lu
          </button>
        </div>
      )}
    </div>
  );
}
