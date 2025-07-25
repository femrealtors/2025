-- Tabla de Contactos
CREATE TABLE contacts (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT,
  phone_number TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Mensajes
CREATE TABLE messages (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  contact_id BIGINT REFERENCES contacts(id),
  content TEXT,
  message_type TEXT, -- 'text', 'image', 'video', 'audio', 'sticker', 'gif'
  status TEXT, -- 'sent', 'delivered', 'read', 'received', 'failed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
