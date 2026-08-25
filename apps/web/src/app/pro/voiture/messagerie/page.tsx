"use client"

import { useState } from 'react'
import ChatUI from '@/components/messaging/ChatUI'
import ConversationsSidebar from '@/components/messaging/ConversationsSidebar'

export default function CarMessagingPage() {
  const [selectedBooking, setSelectedBooking] = useState<{ id: string; name: string } | null>(null)

  return (
    <div className="w-full">
      <h1 className="text-2xl font-extrabold text-secondary mb-6">Messagerie (Location)</h1>
      <div className="flex gap-6">
        <ConversationsSidebar 
          selectedBookingId={selectedBooking?.id}
          onSelectBooking={(id, name) => setSelectedBooking({ id, name })} 
        />
        <div className="flex-1">
          <ChatUI 
            role="pro" 
            bookingId={selectedBooking?.id || ''} 
            chatName={selectedBooking?.name || 'Sélectionnez une conversation'} 
          />
        </div>
      </div>
    </div>
  )
}
