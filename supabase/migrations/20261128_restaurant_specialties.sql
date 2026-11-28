-- ============================================================================
-- CLICBOUFFE - SPÉCIALITÉS CULINAIRES MULTIPLES (MAX 3 PAR RESTAURANT)
-- Conforme aux règles Zero-Trust, RLS et Postgres Best Practices (AGENTS.md)
-- ============================================================================

-- 1. Ajout de la colonne categories TEXT[] sur public.restaurants
ALTER TABLE public.restaurants
    ADD COLUMN IF NOT EXISTS categories TEXT[];

-- Backfill des restaurants existants à partir de category
UPDATE public.restaurants
SET categories = ARRAY[COALESCE(NULLIF(trim(category), ''), 'Pâtes Traditionnelles Béninoises (Amiwo, Télibo, Wɔ̌, Akassa)')]
WHERE categories IS NULL OR cardinality(categories) = 0;

ALTER TABLE public.restaurants
    ALTER COLUMN categories SET DEFAULT ARRAY['Pâtes Traditionnelles Béninoises (Amiwo, Télibo, Wɔ̌, Akassa)']::TEXT[],
    ALTER COLUMN categories SET NOT NULL;

ALTER TABLE public.restaurants
    DROP CONSTRAINT IF EXISTS chk_restaurants_categories_limit;

ALTER TABLE public.restaurants
    ADD CONSTRAINT chk_restaurants_categories_limit
    CHECK (cardinality(categories) >= 1 AND cardinality(categories) <= 3);

CREATE INDEX IF NOT EXISTS idx_restaurants_categories
    ON public.restaurants USING GIN (categories);
