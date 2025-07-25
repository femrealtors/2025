-- Habilitar RLS en las tablas (si no lo está ya)
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Políticas para la tabla 'contacts'
CREATE POLICY "Allow anonymous read access to all contacts"
ON public.contacts FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow anonymous insert access to all contacts"
ON public.contacts FOR INSERT
TO anon
WITH CHECK (true);

-- Políticas para la tabla 'messages'
CREATE POLICY "Allow anonymous read access to all messages"
ON public.messages FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow anonymous insert access to all messages"
ON public.messages FOR INSERT
TO anon
WITH CHECK (true);
