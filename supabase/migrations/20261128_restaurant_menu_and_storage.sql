-- ============================================================================
-- CLICBOUFFE - MENU DES PLATS ENRICHI & STOCKAGE MÉDIAS RESTAURANTS (GALERIE)
-- Conforme aux règles Zero-Trust, RLS et Postgres Best Practices (AGENTS.md)
-- ============================================================================

-- 1. Extension de public.dishes (Catégories de carte, temps de préparation & ordre)
ALTER TABLE public.dishes
    ADD COLUMN IF NOT EXISTS category_label TEXT DEFAULT 'Plats Principaux',
    ADD COLUMN IF NOT EXISTS prep_time_min INTEGER NOT NULL DEFAULT 15
        CHECK (prep_time_min >= 3 AND prep_time_min <= 180),
    ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_dishes_restaurant_category
    ON public.dishes(restaurant_id, category_label, display_order);

-- 2. Bucket Supabase Storage pour photos de couverture, logos et photos de plats
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'restaurant-media',
    'restaurant-media',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']::text[];

-- 3. Politiques RLS strictes sur storage.objects (chacun gère uniquement son dossier UID)
DROP POLICY IF EXISTS "Lecture publique des médias restaurants" ON storage.objects;
CREATE POLICY "Lecture publique des médias restaurants"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'restaurant-media');

DROP POLICY IF EXISTS "Les utilisateurs uploadent leurs médias restaurants" ON storage.objects;
CREATE POLICY "Les utilisateurs uploadent leurs médias restaurants"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'restaurant-media'
        AND (storage.foldername(name))[1] = (select auth.uid())::text
    );

DROP POLICY IF EXISTS "Les utilisateurs mettent à jour leurs médias restaurants" ON storage.objects;
CREATE POLICY "Les utilisateurs mettent à jour leurs médias restaurants"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'restaurant-media'
        AND (storage.foldername(name))[1] = (select auth.uid())::text
    )
    WITH CHECK (
        bucket_id = 'restaurant-media'
        AND (storage.foldername(name))[1] = (select auth.uid())::text
    );

DROP POLICY IF EXISTS "Les utilisateurs suppriment leurs médias restaurants" ON storage.objects;
CREATE POLICY "Les utilisateurs suppriment leurs médias restaurants"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'restaurant-media'
        AND (storage.foldername(name))[1] = (select auth.uid())::text
    );
