-- ============================================================================
-- CLICBOUFFE - SCHÉMA INITIAL DE BASE DE DONNÉES (POSTGRESQL 16 / SUPABASE)
-- Conforme aux règles d'architecture et de sécurité strictes d'AGENTS.md
-- ============================================================================

-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. FONCTIONS UTILITAIRES (Triggers de mise à jour automatique)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 2. TABLE PROFILES (Profils utilisateurs liés à Supabase Auth)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT UNIQUE,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'restaurant_owner', 'courier', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER tr_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Politiques RLS pour profiles
CREATE POLICY "Les profils sont visibles par les utilisateurs authentifiés"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Un utilisateur peut modifier uniquement son propre profil"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Trigger automatique de création de profil à l'inscription Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone_number, role, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
        NEW.phone,
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 3. TABLE RESTAURANTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    phone_number TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    open_time TIME,
    close_time TIME,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER tr_restaurants_updated_at
    BEFORE UPDATE ON public.restaurants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Politiques RLS pour restaurants
CREATE POLICY "Les restaurants actifs sont visibles publiquement"
    ON public.restaurants FOR SELECT
    TO anon, authenticated
    USING (is_active = true OR (auth.uid() = owner_id));

CREATE POLICY "Les restaurateurs peuvent modifier leur propre restaurant"
    ON public.restaurants FOR UPDATE
    TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Les restaurateurs peuvent créer leur restaurant"
    ON public.restaurants FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

-- ----------------------------------------------------------------------------
-- 4. TABLE CATEGORIES (Ex: Plats familiers, Plats courants, Exotiques...)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les catégories sont visibles par tous"
    ON public.categories FOR SELECT
    TO anon, authenticated
    USING (true);

-- ----------------------------------------------------------------------------
-- 5. TABLE DISHES (Plats du catalogue & spécifiques aux restaurants)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL CHECK (price >= 0), -- Prix en FCFA
    image_url TEXT,
    is_available BOOLEAN NOT NULL DEFAULT true,
    is_free_eligible BOOLEAN NOT NULL DEFAULT false, -- Éligible offre 'Bouffe gratuite'
    allows_customization BOOLEAN NOT NULL DEFAULT false, -- 'Composer plat'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER tr_dishes_updated_at
    BEFORE UPDATE ON public.dishes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Politiques RLS pour dishes
CREATE POLICY "Les plats disponibles sont visibles publiquement"
    ON public.dishes FOR SELECT
    TO anon, authenticated
    USING (is_available = true OR EXISTS (
        SELECT 1 FROM public.restaurants r
        WHERE r.id = dishes.restaurant_id AND r.owner_id = auth.uid()
    ));

CREATE POLICY "Les restaurateurs gèrent les plats de leur restaurant"
    ON public.dishes FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.restaurants r
        WHERE r.id = dishes.restaurant_id AND r.owner_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.restaurants r
        WHERE r.id = dishes.restaurant_id AND r.owner_id = auth.uid()
    ));

-- ----------------------------------------------------------------------------
-- 6. TABLES POUR "COMPOSER SON PLAT" (Groupes & Options d'ingrédients)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customization_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dish_id UUID NOT NULL REFERENCES public.dishes(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- Ex: 'Choix de la sauce', 'Choix de la viande'
    min_selection INTEGER NOT NULL DEFAULT 1,
    max_selection INTEGER NOT NULL DEFAULT 1,
    is_required BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE public.customization_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Groupes d'options visibles par tous"
    ON public.customization_groups FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE TABLE IF NOT EXISTS public.customization_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.customization_groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- Ex: 'Sauce gombo', 'Poisson braisé'
    additional_price INTEGER NOT NULL DEFAULT 0 CHECK (additional_price >= 0), -- En FCFA
    is_available BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE public.customization_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Options de personnalisation visibles par tous"
    ON public.customization_options FOR SELECT
    TO anon, authenticated
    USING (true);

-- ----------------------------------------------------------------------------
-- 7. TABLE ORDERS (Commandes avec statut temps réel)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
    courier_id UUID REFERENCES public.profiles(id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',           -- En attente de validation
        'confirmed',         -- Confirmée par le restaurant
        'preparing',         -- En cuisine
        'ready_for_pickup',  -- Prête pour le livreur
        'delivering',        -- En cours de livraison
        'delivered',         -- Livrée
        'cancelled'          -- Annulée
    )),
    subtotal INTEGER NOT NULL CHECK (subtotal >= 0),       -- Montant plats en FCFA
    delivery_fee INTEGER NOT NULL CHECK (delivery_fee >= 0), -- Frais de livraison (80, 130, 170 FCFA ou 0)
    total_amount INTEGER NOT NULL CHECK (total_amount >= 0), -- Total en FCFA
    delivery_address TEXT NOT NULL,                         -- Ex: 'Terrain Zico'
    delivery_latitude DOUBLE PRECISION,
    delivery_longitude DOUBLE PRECISION,
    recipient_type TEXT NOT NULL DEFAULT 'moi_seul' CHECK (recipient_type IN ('moi_seul', 'famille_groupe')),
    payment_method TEXT NOT NULL DEFAULT 'mobile_money' CHECK (payment_method IN ('mobile_money', 'cash_on_delivery', 'card')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_reference TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER tr_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Politiques RLS pour orders
CREATE POLICY "Le client peut voir ses propres commandes"
    ON public.orders FOR SELECT
    TO authenticated
    USING (auth.uid() = customer_id);

CREATE POLICY "Le restaurateur peut voir les commandes de son restaurant"
    ON public.orders FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.restaurants r
        WHERE r.id = orders.restaurant_id AND r.owner_id = auth.uid()
    ));

CREATE POLICY "Le livreur assigné peut voir la commande"
    ON public.orders FOR SELECT
    TO authenticated
    USING (auth.uid() = courier_id);

CREATE POLICY "Un client authentifié peut créer une commande pour lui-même"
    ON public.orders FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Le restaurateur peut mettre à jour le statut de sa commande"
    ON public.orders FOR UPDATE
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.restaurants r
        WHERE r.id = orders.restaurant_id AND r.owner_id = auth.uid()
    ));

CREATE POLICY "Le livreur peut mettre à jour le statut de livraison"
    ON public.orders FOR UPDATE
    TO authenticated
    USING (auth.uid() = courier_id);

-- ----------------------------------------------------------------------------
-- 8. TABLE ORDER_ITEMS (Détail des plats d'une commande)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    dish_id UUID NOT NULL REFERENCES public.dishes(id),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
    total_price INTEGER NOT NULL CHECK (total_price >= 0),
    customization_details JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Détails de commande visibles par les personnes autorisées"
    ON public.order_items FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_items.order_id AND (
            o.customer_id = auth.uid() OR
            o.courier_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM public.restaurants r
                WHERE r.id = o.restaurant_id AND r.owner_id = auth.uid()
            )
        )
    ));

CREATE POLICY "Création des articles lors de la commande"
    ON public.order_items FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_items.order_id AND o.customer_id = auth.uid()
    ));

-- ----------------------------------------------------------------------------
-- 9. ACTIVATION DU TEMPS RÉEL SUR LES TABLES CLÉS
-- ----------------------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dishes;

-- ----------------------------------------------------------------------------
-- 10. DONNÉES DE DÉMONSTRATION / AMORÇAGE INITIAL (Seed des maquettes)
-- ----------------------------------------------------------------------------
INSERT INTO public.categories (name, slug, display_order) VALUES
    ('Plats familiers', 'plats-familiers', 1),
    ('Plats courants', 'plats-courants', 2),
    ('Plats soutenus et exotiques', 'plats-soutenus-et-exotiques', 3)
ON CONFLICT (slug) DO NOTHING;
