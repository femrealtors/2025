CREATE OR REPLACE FUNCTION insert_sent_message(
  p_contact_id BIGINT,
  p_content TEXT,
  p_message_type TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.messages (contact_id, content, message_type, status)
  VALUES (p_contact_id, p_content, p_message_type, 'sent');
END;
$$;

GRANT EXECUTE ON FUNCTION public.insert_sent_message(BIGINT, TEXT, TEXT) TO anon;
