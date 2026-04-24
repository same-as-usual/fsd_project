
-- Members table
CREATE TABLE public.members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT NOT NULL,
  image_path TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Public can view
CREATE POLICY "Anyone can view members"
  ON public.members FOR SELECT
  USING (true);

-- Authenticated users can insert
CREATE POLICY "Authenticated users can insert members"
  ON public.members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can update
CREATE POLICY "Authenticated users can update members"
  ON public.members FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Authenticated users can delete
CREATE POLICY "Authenticated users can delete members"
  ON public.members FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for member images
INSERT INTO storage.buckets (id, name, public)
VALUES ('member-images', 'member-images', true);

-- Storage RLS policies
CREATE POLICY "Public can view member images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'member-images');

CREATE POLICY "Authenticated can upload member images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'member-images');

CREATE POLICY "Authenticated can update member images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'member-images');

CREATE POLICY "Authenticated can delete member images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'member-images');
