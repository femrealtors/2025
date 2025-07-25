import type { NextApiRequest, NextApiResponse } from 'next';

// Definimos un tipo para la respuesta esperada
type Data = {
  status?: string;
  message?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log('--- Función send-audio iniciada ---');
  console.log('Método de la petición:', req.method);

  // Solo permitimos peticiones POST
  if (req.method !== 'POST') {
    console.log('Error: Método no permitido.');
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    console.log('Cuerpo de la petición recibido:', req.body);

    const { to, audioUrl, contactId } = req.body;

    // Validación de parámetros
    if (!to || !audioUrl || !contactId) {
      console.log('Error: Faltan parámetros en el cuerpo de la petición.');
      return res.status(400).json({ error: 'Faltan parámetros: to, audioUrl y contactId son requeridos.' });
    }

    console.log(`Parámetros recibidos: to=${to}, audioUrl=${audioUrl}, contactId=${contactId}`);

    // Aquí iría la lógica para enviar el mensaje a WhatsApp
    // Por ahora, simularemos una respuesta exitosa.
    console.log('Simulando envío a la API de WhatsApp...');

    // Simulación de una llamada a la API de Meta
    const metaApiResponse = {
      messaging_product: 'whatsapp',
      contacts: [{ input: to, wa_id: to }],
      messages: [{ id: 'wamid.mock_message_id' }],
    };

    console.log('Respuesta simulada de la API de WhatsApp:', metaApiResponse);

    // Aquí iría la lógica para guardar el mensaje en la base de datos
    // (Vercel Postgres)
    console.log('Simulando guardado en la base de datos...');
    console.log('Mensaje guardado para contactId:', contactId);


    console.log('--- Función send-audio completada exitosamente ---');
    res.status(200).json({ status: 'success', message: 'Audio enviado (simulado).' });

  } catch (error) {
    console.error('Error inesperado en la función send-audio:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
