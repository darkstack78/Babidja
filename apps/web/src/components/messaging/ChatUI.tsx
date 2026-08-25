"use client"

import { useState, useEffect, useRef } from 'react'
import { Send, User } from 'lucide-react'
import { io, Socket } from 'socket.io-client'
import Button from '../ui/Button'
import { useAuthStore } from '@/store/useAuthStore'
import http from '@/lib/http'

interface Message {
  id: string
  bookingId: string
  senderId: string
  senderType: 'CUSTOMER' | 'TENANT' | 'SYSTEM'
  content: string
  createdAt: string
}

interface ChatUIProps {
  role: 'client' | 'pro'
  bookingId: string
  chatName: string
}

export default function ChatUI({ role, bookingId, chatName }: ChatUIProps) {
  const { accessToken } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [optimisticMessage, setOptimisticMessage] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  // Fetch initial messages
  useEffect(() => {
    async function fetchMessages() {
      try {
        const { data } = await http.get(`/messaging/${bookingId}`)
        setMessages(data)
      } catch (error) {
        console.error('Failed to fetch messages', error)
      }
    }
    if (bookingId) {
      fetchMessages()
    }
  }, [bookingId])

  // Setup Socket.io
  useEffect(() => {
    if (!accessToken || !bookingId) return

    // Socket connects to the root URL or /messaging namespace
    // We assume backend runs on localhost:3001
    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'
    
    const socket = io(socketUrl, {
      auth: {
        token: accessToken
      }
    })

    socket.on('connect', () => {
      setIsConnected(true)
      socket.emit('joinRoom', { bookingId })
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('message', (msg: Message) => {
      setMessages((prev) => [...prev, msg])
      setOptimisticMessage(null) // clear optimistic message when actual arrives
      scrollToBottom()
    })

    socket.on('error', (err: string) => {
      console.error('Socket error:', err)
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
    }
  }, [accessToken, bookingId])

  // Auto scroll on initial load
  useEffect(() => {
    scrollToBottom()
  }, [messages.length])

  const handleSend = () => {
    if (!inputValue.trim() || !socketRef.current || !isConnected) return
    
    const content = inputValue;
    setOptimisticMessage(content)
    setInputValue('')
    
    socketRef.current.emit('sendMessage', {
      bookingId,
      content
    })
    scrollToBottom()
  }

  if (!bookingId) {
    return (
      <div className="flex h-[600px] flex-col rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden items-center justify-center">
        <p className="text-gray-500">Sélectionnez une conversation pour commencer</p>
      </div>
    )
  }

  return (
    <div className="flex h-[600px] flex-col rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 p-4">
        <div className="flex items-center gap-4">
          <div className="grid size-12 place-items-center rounded-full bg-pastel text-primary">
            <User className="size-6" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">{chatName}</h2>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <span className={`inline-block size-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {isConnected ? 'En ligne' : 'Déconnecté'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((msg) => {
          // If we are 'pro', our messages have senderType 'TENANT'
          // If we are 'client', our messages have senderType 'CUSTOMER'
          const isMe = role === 'pro' ? msg.senderType === 'TENANT' : msg.senderType === 'CUSTOMER'
          
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl p-4 ${isMe ? 'bg-secondary text-white rounded-br-none' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none shadow-sm'}`}>
                <p className="text-sm">{msg.content}</p>
                <p className={`mt-1 text-xs text-right ${isMe ? 'text-white/80' : 'text-gray-400'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        {optimisticMessage && (
          <div className="flex w-full justify-end">
            <div className="max-w-[80%] rounded-2xl p-4 bg-primary text-white rounded-br-none opacity-50">
              <p className="text-sm">{optimisticMessage}</p>
              <span className="mt-1 block text-right text-[10px] opacity-70">Envoi...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 p-4 bg-white flex gap-3">
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Écrivez votre message..."
          className="flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-secondary disabled:bg-gray-100"
          disabled={!isConnected}
        />
        <Button onClick={handleSend} className="px-5 rounded-xl" disabled={!isConnected || !inputValue.trim()}>
          <Send className="size-5" />
        </Button>
      </div>
    </div>
  )
}
