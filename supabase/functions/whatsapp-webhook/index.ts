import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!
)
const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_TOKEN')!

serve(async (req) => {
  if (req.method === 'GET') {
    const url = new URL(req.url)
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    if (mode === 'subscribe' && token === Deno.env.get('VERIFY_TOKEN')) {
      return new Response(challenge)
    } else {
      return new Response('Failed validation. Make sure the validation tokens match.', { status: 403 })
    }
  }

  if (req.method === 'POST') {
    try {
      const payload = await req.json()
      console.log('Received webhook:', JSON.stringify(payload, null, 2))

      const message = payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
      const contactInfo = payload.entry?.[0]?.changes?.[0]?.value?.contacts?.[0];

      if (message && contactInfo) {
        const from = contactInfo.wa_id;
        const name = contactInfo.profile.name;
        const messageType = message.type;
        let messageContent: string | null = null;

        // Buscar o crear el contacto
        let { data: contact, error: contactError } = await supabase
          .from('contacts')
          .select('id')
          .eq('phone_number', from)
          .single();
        
        if (contactError && contactError.code === 'PGRST116') {
          const { data: newContact, error: newContactError } = await supabase
            .from('contacts')
            .insert({ phone_number: from, name: name })
            .select('id')
            .single();
          if (newContactError) throw newContactError;
          contact = newContact;
        } else if (contactError) {
          throw contactError;
        }

        if (messageType === 'text') {
          messageContent = message.text?.body;
        } else if (messageType === 'audio') {
          const audioId = message.audio?.id;
          if (audioId) {
            // 1. Obtener la URL del audio desde Meta
            const mediaUrlResponse = await fetch(`https://graph.facebook.com/v19.0/${audioId}`, {
              headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` },
            });
            const mediaUrlData = await mediaUrlResponse.json();
            const mediaUrl = mediaUrlData.url;

            // 2. Descargar el archivo de audio
            const audioResponse = await fetch(mediaUrl, {
              headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` },
            });
            const audioBlob = await audioResponse.blob();

            // 3. Subir a Supabase Storage
            const filePath = `public/${from}_${Date.now()}.ogg`;
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('voicenotes')
              .upload(filePath, audioBlob, { contentType: 'audio/ogg' });
            
            if (uploadError) throw uploadError;

            // 4. Obtener la URL pública
            const { data: publicUrlData } = supabase.storage
              .from('voicenotes')
              .getPublicUrl(filePath);
            
            messageContent = publicUrlData.publicUrl;
          }
        }

        if (contact && messageContent) {
          // Guardar el mensaje
          const { error: messageError } = await supabase.from('messages').insert({
            contact_id: contact.id,
            content: messageContent,
            message_type: messageType,
            status: 'received',
          });
          if (messageError) throw messageError;
        }
      }

      return new Response('ok')
    } catch (error) {
      console.error('Error processing webhook:', error)
      return new Response('Internal Server Error', { status: 500 })
    }
  }

  return new Response('Method Not Allowed', { status: 405 })
})
