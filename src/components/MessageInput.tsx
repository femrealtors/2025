'use client'

import { useState, useRef } from 'react'
// import { supabase } from '@/lib/supabaseClient' // Comentado
import { Send, Mic } from 'lucide-react'

export default function MessageInput({
  contactId,
  contactPhone,
  onNewMessage,
}: {
  contactId: number
  contactPhone: string
  onNewMessage: (message: any) => void
}) {
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const handleStartRecording = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }
      mediaRecorderRef.current.onstop = handleSendAudio
      mediaRecorderRef.current.start()
      setIsRecording(true)
    }
  }

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleSendAudio = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/ogg; codecs=opus' })
    audioChunksRef.current = []

    const optimisticMessage = {
      id: Math.random(),
      contact_id: contactId,
      content: URL.createObjectURL(audioBlob),
      message_type: 'audio',
      status: 'sent',
      created_at: new Date().toISOString(),
    }
    onNewMessage(optimisticMessage)

    // --- TODO: Refactorizar con Vercel Blob y Vercel Functions ---
    // 1. Subir el archivo de audio a Vercel Blob (próximo paso)
    const audioUrl = 'https://example.com/mock-audio.ogg'; // URL de marcador de posición por ahora

    // 2. Invocar la Vercel Function con la URL del audio
    try {
      const response = await fetch('/api/send-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: contactPhone,
          audioUrl: audioUrl, // Usaremos una URL real cuando integremos Vercel Blob
          contactId: contactId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error al llamar a la función send-audio:', result.error);
        // Aquí podrías actualizar el mensaje optimista a un estado de 'failed'
      } else {
        console.log('Respuesta de la función send-audio:', result.message);
      }
    } catch (error) {
      console.error('Error de red o al procesar la petición a send-audio:', error);
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !contactId || !contactPhone) return

    const optimisticMessage = {
      id: Math.random(), // ID temporal
      contact_id: contactId,
      content: message,
      message_type: 'text',
      status: 'sent',
      created_at: new Date().toISOString(),
    }

    onNewMessage(optimisticMessage)
    setMessage('')

    // --- TODO: Refactorizar con Vercel Functions ---
    // Invocar la Edge Function para enviar el mensaje por WhatsApp
    // const { error: invokeError } = await supabase.functions.invoke('send-message', {
    //   body: { to: contactPhone, message: message },
    // })

    // if (invokeError) {
    //   console.error('Error invoking send-message function:', invokeError)
    //   if (invokeError.context && invokeError.context.json) {
    //     console.error('Detailed error from function:', await invokeError.context.json());
    //   }
    //   // Aquí podrías actualizar el mensaje optimista a un estado de 'failed'
    //   // Por ejemplo: onUpdateMessage({ ...optimisticMessage, status: 'failed' })
    // }
    // No guardamos en la DB desde aquí. Confiamos en los webhooks.
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
      <div className="flex items-center space-x-4">
        <input
          type="text"
          placeholder={isRecording ? 'Grabando...' : 'Escribe un mensaje...'}
          className="flex-1 p-3 border rounded-full dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isRecording}
        />
        {message ? (
          <button
            onClick={handleSendMessage}
            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Send size={20} />
          </button>
        ) : (
          <button
            onMouseDown={handleStartRecording}
            onMouseUp={handleStopRecording}
            onTouchStart={handleStartRecording}
            onTouchEnd={handleStopRecording}
            className={`p-3 rounded-full text-white ${
              isRecording ? 'bg-red-500' : 'bg-blue-500'
            }`}
          >
            <Mic size={20} />
          </button>
        )}
      </div>
    </div>
  )
}
