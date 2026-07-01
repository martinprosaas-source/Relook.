-- ── Profiles (1 ligne par user, créée automatiquement à l'inscription) ──────
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email      TEXT,
  credits    INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lecture profil proprio"     ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "mise à jour profil proprio" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ── Générations ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.generations (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  photo_url         TEXT        NOT NULL,
  detected_vehicle  JSONB,
  modification      JSONB,
  result_url        TEXT,
  credits_used      INTEGER     NOT NULL DEFAULT 1,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lecture générations proprio"  ON public.generations FOR SELECT  USING (auth.uid() = user_id);
CREATE POLICY "insertion générations proprio" ON public.generations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── Storage buckets ───────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('results', 'results', true) ON CONFLICT DO NOTHING;

CREATE POLICY "upload authentifié" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "lecture publique uploads" ON storage.objects FOR SELECT
  USING (bucket_id IN ('uploads', 'results'));

CREATE POLICY "upload résultats service" ON storage.objects FOR INSERT TO service_role
  WITH CHECK (bucket_id = 'results');

-- ── Trigger : créer le profil à l'inscription ────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, credits)
  VALUES (NEW.id, NEW.email, 1);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
