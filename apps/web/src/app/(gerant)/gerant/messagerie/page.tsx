'use client';

import { useState, useEffect } from 'react'
import { Loader2, User, MessageSquare } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import http from '@/lib/http'
import ChatUI from '@/components/messaging/ChatUI'

interface Conversation {
  bookingId: string;
  bookingRef: string;
  customerName: string;
}

export default function AdminMessagerie() {
  const { user } = useAuthStore()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedBooking, setSelectedBooking] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.tenantId) return
    http.get(`/tenant/${user.tenantId}/bookings`)
      .then(res => {
        const convs = res.data.map((b: any) => ({
          bookingId: b.id,
          bookingRef: b.bookingRef,
          customerName: b.user ? `${b.user.firstName} ${b.user.lastName}`.trim() || b.user.email || 'Client' : 'Client',
        }))
        setConversations(convs)
      })
      .finally(() => setLoading(false))
  }, [user?.tenantId])

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#e97c2a]" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6">
      {/* Liste des conversations */}
      <div className="w-1/3 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-y-auto flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 sticky top-0">
          <h2 className="font-extrabold text-lg text-gray-900">Conversations</h2>
        </div>
        <div className="flex-1 p-2">
          {conversations.length === 0 ? (
            <p className="text-gray-500 text-sm text-center mt-4">Aucune conversation.</p>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.bookingId}
                onClick={() => setSelectedBooking(conv)}
                className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${
                  selectedBooking?.bookingId === conv.bookingId ? 'bg-orange-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className={`grid size-10 place-items-center rounded-full ${
                  selectedBooking?.bookingId === conv.bookingId ? 'bg-[#e97c2a] text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  <User className="size-5" />
                </div>
                <div className="overflow-hidden">
                  <p className={`font-semibold text-sm truncate ${
                    selectedBooking?.bookingId === conv.bookingId ? 'text-[#e97c2a]' : 'text-gray-900'
                  }`}>
                    {conv.customerName}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">Réf: {conv.bookingRef}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Fenêtre de Chat */}
      <div className="flex-1 h-full">
        {selectedBooking ? (
          <ChatUI 
            role="pro" 
            bookingId={selectedBooking.bookingId} 
            chatName={`Discussion - ${selectedBooking.customerName}`} 
          />
        ) : (
          <div className="flex h-full flex-col rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden items-center justify-center text-gray-400">
            <MessageSquare className="size-12 mb-3 opacity-20" />
            <p>Sélectionnez une conversation pour commencer</p>
          </div>
        )}
      </div>
    </div>
  )
}
