-- Reconstrucción de políticas de seguridad para evitar errores de RLS en inserciones por lotes
DROP POLICY IF EXISTS "Enable all for authenticated users on products" ON public.products;
DROP POLICY IF EXISTS "Enable all for authenticated users on collaborators" ON public.collaborators;

-- Políticas explícitas para el rol 'authenticated' que garantizan la inserción
CREATE POLICY "Enable all for authenticated users on products" 
  ON public.products FOR ALL 
  USING (auth.role() = 'authenticated') 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users on collaborators" 
  ON public.collaborators FOR ALL 
  USING (auth.role() = 'authenticated') 
  WITH CHECK (auth.role() = 'authenticated');

-- Refuerzo y ampliación de políticas para Storage (Avatars y Products)
DROP POLICY IF EXISTS "Auth Insert avatars" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete avatars" ON storage.objects;

CREATE POLICY "Auth Insert avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Auth Update avatars" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars');
CREATE POLICY "Auth Delete avatars" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Auth Insert products" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update products" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete products" ON storage.objects;

CREATE POLICY "Auth Insert products" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'products');
CREATE POLICY "Auth Update products" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'products');
CREATE POLICY "Auth Delete products" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'products');
