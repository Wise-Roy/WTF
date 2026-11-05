-- Storage bucket + policies for design/press images (bucket 'designs')
INSERT INTO storage.buckets (id, name, public) VALUES ('designs', 'designs', true) ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "Public read designs" ON storage.objects;
DROP POLICY IF EXISTS "Admin insert designs" ON storage.objects;
DROP POLICY IF EXISTS "Admin update designs" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete designs" ON storage.objects;

CREATE POLICY "Public read designs" ON storage.objects FOR SELECT USING (bucket_id = 'designs');
CREATE POLICY "Admin insert designs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'designs');
CREATE POLICY "Admin update designs" ON storage.objects FOR UPDATE USING (bucket_id = 'designs');
CREATE POLICY "Admin delete designs" ON storage.objects FOR DELETE USING (bucket_id = 'designs');
