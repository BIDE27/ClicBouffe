-- ============================================================================
-- CLICBOUFFE - EXTENSION BACKEND DYNAMIQUE, INDEXES & SEED RESTAURATEUR
-- Conforme aux règles d'architecture et de sécurité strictes d'AGENTS.md
-- ============================================================================

-- 1. Indexation pour performances maximales (Zero-Dette Technique)
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON public.orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_dishes_restaurant_id ON public.dishes(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_dishes_available ON public.dishes(is_available);

-- 2. Table pour les abonnements de repas récurrents
CREATE TABLE IF NOT EXISTS public.meal_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE SET NULL,
    plan_name TEXT NOT NULL,
    frequency TEXT NOT NULL,
    scheduled_time TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    price_per_period INTEGER NOT NULL CHECK (price_per_period >= 0),
    status TEXT NOT NULL DEFAULT 'actif' CHECK (status IN ('actif', 'en_pause', 'annule')),
    renewal_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.meal_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les clients gèrent leurs abonnements"
    ON public.meal_subscriptions FOR ALL
    TO authenticated
    USING (auth.uid() = customer_id)
    WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Les restaurateurs voient les abonnements qui les concernent"
    ON public.meal_subscriptions FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.restaurants r
        WHERE r.id = meal_subscriptions.restaurant_id AND r.owner_id = auth.uid()
    ));

-- 3. Activation de la publication temps réel sur les abonnements
ALTER PUBLICATION supabase_realtime ADD TABLE public.meal_subscriptions;
