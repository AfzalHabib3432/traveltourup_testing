-- Supabase Storage buckets + RLS (requires `storage` schema). Idempotent on re-deploy.
-- Run after baseline_public_schema on Supabase Postgres.

-- Private: user avatars / documents — paths like `{auth.uid()}/...`
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-uploads', 'user-uploads', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "user_uploads_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "user_uploads_select_own" ON storage.objects;
DROP POLICY IF EXISTS "user_uploads_update_own" ON storage.objects;
DROP POLICY IF EXISTS "user_uploads_delete_own" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

CREATE POLICY "user_uploads_insert_own"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'user-uploads'
  AND split_part(name, '/', 1) = auth.uid()::text
);

CREATE POLICY "user_uploads_select_own"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'user-uploads'
  AND split_part(name, '/', 1) = auth.uid()::text
);

CREATE POLICY "user_uploads_update_own"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'user-uploads'
  AND split_part(name, '/', 1) = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'user-uploads'
  AND split_part(name, '/', 1) = auth.uid()::text
);

CREATE POLICY "user_uploads_delete_own"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'user-uploads'
  AND split_part(name, '/', 1) = auth.uid()::text
);

-- Public: blog hero images (uploads via service role from API routes)
INSERT INTO storage.buckets (id, name, public)
VALUES ('blogs_images', 'blogs_images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "blogs_images_public_select" ON storage.objects;

CREATE POLICY "blogs_images_public_select"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'blogs_images');
