-- Tabla de Colaboradores
CREATE TABLE public.collaborators (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de Productos
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  status TEXT DEFAULT 'Disponible',
  stock NUMERIC DEFAULT 0,
  min_stock NUMERIC DEFAULT 0,
  price NUMERIC DEFAULT 0,
  cost NUMERIC DEFAULT 0,
  specs TEXT,
  image_url TEXT,
  client_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad para Collaborators
CREATE POLICY "Enable all for authenticated users on collaborators" ON public.collaborators FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas de Seguridad para Products
CREATE POLICY "Enable all for authenticated users on products" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Buckets de Storage
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true) ON CONFLICT DO NOTHING;

-- Políticas de Storage para Avatars
CREATE POLICY "Public Access avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Auth Insert avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Auth Update avatars" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars');

-- Políticas de Storage para Products
CREATE POLICY "Public Access products" ON storage.objects FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "Auth Insert products" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'products');
CREATE POLICY "Auth Update products" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'products');

-- Seed Data Inicial
DO $
DECLARE
  new_user_id uuid;
BEGIN
  new_user_id := gen_random_uuid();
  
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role, aud,
    confirmation_token, recovery_token, email_change_token_new,
    email_change, email_change_token_current,
    phone, phone_change, phone_change_token, reauthentication_token
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'admin@gmc.cl',
    crypt('Admin123!', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Administrador"}',
    false, 'authenticated', 'authenticated',
    '', '', '', '', '',
    NULL, '', '', ''
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.collaborators (id, name, email, role)
  VALUES (new_user_id, 'Administrador GMC', 'admin@gmc.cl', 'Administrador')
  ON CONFLICT (email) DO NOTHING;
END $;
