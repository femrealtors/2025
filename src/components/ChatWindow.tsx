'use client'

import { useEffect, useRef } from 'react'

export default function ChatWindow({ messages }: { messages: any[] }) {
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4">
      {messages.map((message) => {
        const isSent = message.status === 'sent' || message.status === 'failed'
        return (
          <div
            key={message.id}
            className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-xs lg:max-w-md ${
                isSent
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
              }`}
            >
              {message.message_type === 'audio' ? (
                <audio controls src={message.content} className="w-full"></audio>
              ) : (
                <p className="break-words">{message.content}</p>
              )}
              <p
                className={`text-xs mt-1 text-right ${
                  isSent ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
