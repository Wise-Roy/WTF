-- Buckets the admin upload route writes to that the schema never created.
-- Uploads go through /api/admin/upload, which signs the URL with the service role,
-- so only service_role may write; everyone may read.
INSERT INTO storage.buckets (id, name, public) VALUES
  ('products', 'products', true),
  ('about', 'about', true),
  ('musicians', 'musicians', true),
  ('designer', 'designer', true),
  ('offers', 'offers', true)
ON CONFLICT DO NOTHING;

DO $$
DECLARE b text;
BEGIN
  FOREACH b IN ARRAY ARRAY['products', 'about', 'musicians', 'designer', 'offers'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Public read %1$s" ON storage.objects', b);
    EXECUTE format('DROP POLICY IF EXISTS "Admin write %1$s" ON storage.objects', b);
    EXECUTE format(
      'CREATE POLICY "Public read %1$s" ON storage.objects FOR SELECT USING (bucket_id = %1$L)', b);
    EXECUTE format(
      'CREATE POLICY "Admin write %1$s" ON storage.objects FOR ALL TO service_role USING (bucket_id = %1$L) WITH CHECK (bucket_id = %1$L)', b);
  END LOOP;
END $$;
