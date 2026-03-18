-- Re-affirm RLS policies for products to explicitly allow bulk INSERT and UPDATE (Upsert) for authenticated users
DROP POLICY IF EXISTS "Enable INSERT for authenticated users" ON public.products;
CREATE POLICY "Enable INSERT for authenticated users" 
  ON public.products 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable UPDATE for authenticated users" ON public.products;
CREATE POLICY "Enable UPDATE for authenticated users" 
  ON public.products 
  FOR UPDATE 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);
