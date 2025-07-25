'use client';

import { useState, useEffect } from 'react';
import ContactList from '@/components/ContactList';
import ChatWindow from '@/components/ChatWindow';
import MessageInput from '@/components/MessageInput';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);

  // Efecto para cargar mensajes cuando se selecciona un contacto
  useEffect(() => {
    if (!selectedContact) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('contact_id', selectedContact.id)
        .order('created_at', { ascending: true });
      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        setMessages(data || []);
      }
    };
    fetchMessages();
  }, [selectedContact]);

  // Efecto para la suscripción en tiempo real
  useEffect(() => {
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          if (payload.new.contact_id === selectedContact?.id) {
            setMessages((prevMessages) => {
              // Reemplazar el mensaje optimista si existe, o añadir el nuevo si no.
              const optimisticIndex = prevMessages.findIndex(
                (msg) => !msg.id && msg.content === payload.new.content
              );

              if (optimisticIndex !== -1) {
                const newMessages = [...prevMessages];
                newMessages[optimisticIndex] = payload.new;
                return newMessages;
              } else {
                // Asegurarse de no añadir un mensaje que ya existe
                if (!prevMessages.some((msg) => msg.id === payload.new.id)) {
                  return [...prevMessages, payload.new];
                }
              }
              return prevMessages;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedContact]);

  const handleNewMessage = (newMessage: any) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <aside className="w-1/3 bg-white dark:bg-gray-800 p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Contactos</h2>
        <ContactList onSelectContact={setSelectedContact} />
      </aside>
      <main className="w-2/3 flex flex-col">
        {selectedContact ? (
          <>
            <header className="bg-white dark:bg-gray-800 p-4 border-b dark:border-gray-700">
              <h2 className="text-xl font-semibold">{selectedContact.name}</h2>
            </header>
            <ChatWindow messages={messages} />
            <MessageInput
              contactId={selectedContact.id}
              contactPhone={selectedContact.phone_number}
              onNewMessage={handleNewMessage}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p>Selecciona un contacto para empezar a chatear</p>
          </div>
        )}
      </main>
    </div>
  );
}
