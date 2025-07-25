CREATE POLICY "Allow anonymous uploads to voicenotes"
ON storage.objects FOR INSERT
TO anon
WITH CHECK ( bucket_id = 'voicenotes' );
