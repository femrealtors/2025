import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-custom-data',
}

export default async function(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SERVICE_KEY')! // THE REAL FIX
    )

    const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_TOKEN')
    const PHONE_NUMBER_ID = Deno.env.get('PHONE_NUMBER_ID')

    if (!WHATSAPP_TOKEN) throw new Error('Environment variable WHATSAPP_TOKEN is not set.')
    if (!PHONE_NUMBER_ID) throw new Error('Environment variable PHONE_NUMBER_ID is not set.')

    const { to, audioUrl, contactId } = await req.json()
    if (!to) throw new Error('Recipient phone number "to" is missing.')
    if (!audioUrl) throw new Error('Audio URL "audioUrl" is missing.')
    if (!contactId) throw new Error('Contact ID "contactId" is missing.')

    const SEND_URL = `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`

    const sendMessageResponse = await fetch(SEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'audio',
        audio: { link: audioUrl },
      }),
    })

    if (!sendMessageResponse.ok) {
      const errorData = await sendMessageResponse.json()
      throw new Error(`Sending message failed: ${JSON.stringify(errorData)}`)
    }

    const { error: dbError } = await supabase.from('messages').insert({
      contact_id: contactId,
      content: audioUrl,
      message_type: 'audio',
      status: 'sent',
    })

    if (dbError) {
      console.error('Failed to save sent message to DB:', dbError)
    }

    const responseData = await sendMessageResponse.json()

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e)
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}
