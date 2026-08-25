import ChatUI from '@/components/messaging/ChatUI'

export default function ClientMessagingPage() {
  return (
    <div className="w-full">
      <h1 className="text-2xl font-extrabold text-secondary mb-6">Messagerie</h1>
      <ChatUI role="client" />
    </div>
  )
}
