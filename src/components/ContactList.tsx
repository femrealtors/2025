'use client'

import { useState, useEffect } from 'react'
// import { supabase } from '@/lib/supabaseClient' // Comentado

export default function ContactList({ onSelectContact }: { onSelectContact: (contact: any) => void }) {
  const [contacts, setContacts] = useState<any[]>([
    // --- TODO: Refactorizar para obtener datos desde Vercel Postgres ---
    // Datos de ejemplo para que la UI no se rompa
    { id: 1, name: 'Ejemplo Contacto 1', phone_number: '+123456789' },
    { id: 2, name: 'Ejemplo Contacto 2', phone_number: '+987654321' },
  ])

  useEffect(() => {
    // const fetchContacts = async () => {
    //   const { data, error } = await supabase.from('contacts').select('*')
    //   if (error) {
    //     console.error('Error fetching contacts:', error)
    //   } else {
    //     setContacts(data)
    //   }
    // }
    // fetchContacts()
  }, [])

  const getInitials = (name: string) => {
    if (!name) return '?'
    const names = name.split(' ')
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div className="space-y-1">
      {contacts.map((contact) => (
        <div
          key={contact.id}
          className="flex items-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors"
          onClick={() => onSelectContact(contact)}
        >
          <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold mr-3">
            {getInitials(contact.name)}
          </div>
          <div className="flex-1">
            <p className="font-semibold">{contact.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{contact.phone_number}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
