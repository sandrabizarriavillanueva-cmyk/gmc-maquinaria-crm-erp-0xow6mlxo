-- Re-create granular RLS policies for products table to ensure batch imports work
DROP POLICY IF EXISTS "Enable all for authenticated users on products" ON public.products;
DROP POLICY IF EXISTS "Enable SELECT for authenticated users" ON public.products;
DROP POLICY IF EXISTS "Enable INSERT for authenticated users" ON public.products;
DROP POLICY IF EXISTS "Enable UPDATE for authenticated users" ON public.products;
DROP POLICY IF EXISTS "Enable DELETE for authenticated users" ON public.products;

CREATE POLICY "Enable SELECT for authenticated users" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable INSERT for authenticated users" ON public.products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable UPDATE for authenticated users" ON public.products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable DELETE for authenticated users" ON public.products FOR DELETE TO authenticated USING (true);

-- Re-create granular RLS policies for collaborators table
DROP POLICY IF EXISTS "Enable all for authenticated users on collaborators" ON public.collaborators;
DROP POLICY IF EXISTS "Enable SELECT for authenticated users" ON public.collaborators;
DROP POLICY IF EXISTS "Enable INSERT for authenticated users" ON public.collaborators;
DROP POLICY IF EXISTS "Enable UPDATE for authenticated users" ON public.collaborators;
DROP POLICY IF EXISTS "Enable DELETE for authenticated users" ON public.collaborators;

CREATE POLICY "Enable SELECT for authenticated users" ON public.collaborators FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable INSERT for authenticated users" ON public.collaborators FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable UPDATE for authenticated users" ON public.collaborators FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable DELETE for authenticated users" ON public.collaborators FOR DELETE TO authenticated USING (true);

-- Ensure storage buckets exist and are public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Fix storage policies for avatars
DROP POLICY IF EXISTS "Auth Insert avatars" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete avatars" ON storage.objects;
DROP POLICY IF EXISTS "Give public access to avatars" ON storage.objects;

CREATE POLICY "Give public access to avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Auth Insert avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Auth Update avatars" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars');
CREATE POLICY "Auth Delete avatars" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars');

-- Fix storage policies for products
DROP POLICY IF EXISTS "Auth Insert products" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update products" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete products" ON storage.objects;
DROP POLICY IF EXISTS "Give public access to products" ON storage.objects;

CREATE POLICY "Give public access to products" ON storage.objects FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "Auth Insert products" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'products');
CREATE POLICY "Auth Update products" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'products');
CREATE POLICY "Auth Delete products" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'products');
