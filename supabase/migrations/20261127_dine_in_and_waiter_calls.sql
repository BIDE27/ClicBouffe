-- ============================================================================
-- CLICBOUFFE - DIGITALISATION DE SALLE, SERVICE SUR PLACE QR & APPELS SERVEUR
-- Conforme aux règles Zero-Trust, RLS et Postgres Best Practices (AGENTS.md)
-- ============================================================================

-- 1. Extension de la table public.restaurants (Modes de vente, Salle & QR)
ALTER TABLE public.restaurants
    ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Cuisine Locale & Grillades',
    ADD COLUMN IF NOT EXISTS sales_mode TEXT NOT NULL DEFAULT 'hybrid'
        CHECK (sales_mode IN ('online_only', 'dine_in_only', 'hybrid')),
    ADD COLUMN IF NOT EXISTS tables_count INTEGER NOT NULL DEFAULT 10
        CHECK (tables_count >= 0 AND tables_count <= 500),
    ADD COLUMN IF NOT EXISTS table_zones TEXT[] NOT NULL DEFAULT ARRAY['Salle Principale']::TEXT[],
    ADD COLUMN IF NOT EXISTS avg_prep_time_min INTEGER NOT NULL DEFAULT 20
        CHECK (avg_prep_time_min >= 5 AND avg_prep_time_min <= 180),
    ADD COLUMN IF NOT EXISTS allows_dine_in_composition BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS allows_waiter_call BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS accepts_cash_on_site BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS is_open BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON public.restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_sales_mode ON public.restaurants(sales_mode);
CREATE INDEX IF NOT EXISTS idx_restaurants_owner_id ON public.restaurants(owner_id);

-- 2. Extension de la table public.orders (Commandes sur place & délai de service)
ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS order_type TEXT NOT NULL DEFAULT 'delivery'
        CHECK (order_type IN ('delivery', 'pickup', 'dine_in')),
    ADD COLUMN IF NOT EXISTS table_number TEXT,
    ADD COLUMN IF NOT EXISTS estimated_serve_minutes INTEGER
        CHECK (estimated_serve_minutes IS NULL OR (estimated_serve_minutes >= 1 AND estimated_serve_minutes <= 240)),
    ADD COLUMN IF NOT EXISTS promised_ready_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS customer_name TEXT,
    ADD COLUMN IF NOT EXISTS customer_phone TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_order_type ON public.orders(order_type);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_created ON public.orders(restaurant_id, created_at DESC);

-- Optimisation RLS existantes avec (select auth.uid()) et protection is_verified / profiles.role
DROP POLICY IF EXISTS "Les restaurateurs peuvent créer leur restaurant" ON public.restaurants;
CREATE POLICY "Les restaurateurs peuvent créer leur restaurant"
    ON public.restaurants FOR INSERT
    TO authenticated
    WITH CHECK (
        (select auth.uid()) = owner_id
        AND is_verified = false
    );

DROP POLICY IF EXISTS "Les restaurateurs peuvent modifier leur propre restaurant" ON public.restaurants;
CREATE POLICY "Les restaurateurs peuvent modifier leur propre restaurant"
    ON public.restaurants FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = owner_id)
    WITH CHECK ((select auth.uid()) = owner_id);

REVOKE UPDATE (is_verified) ON public.restaurants FROM authenticated;

REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, phone_number, avatar_url) ON public.profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.promote_owner_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.profiles
    SET role = 'restaurant_owner'
    WHERE id = NEW.owner_id AND role = 'customer';
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_promote_owner_role ON public.restaurants;
CREATE TRIGGER tr_promote_owner_role
    AFTER INSERT ON public.restaurants
    FOR EACH ROW EXECUTE FUNCTION public.promote_owner_role();

-- Durcissement orders (empêcher auto-validation paiement ou statut coté client et supprimer doublon politique INSERT)
DROP POLICY IF EXISTS "Un client authentifié peut créer une commande pour lui-même" ON public.orders;
DROP POLICY IF EXISTS "Les clients peuvent créer leurs propres commandes" ON public.orders;
CREATE POLICY "Les clients peuvent créer leurs propres commandes"
    ON public.orders FOR INSERT
    TO authenticated
    WITH CHECK (
        (select auth.uid()) = customer_id
        AND status = 'pending'
        AND payment_status = 'pending'
    );

REVOKE UPDATE (payment_status, total_amount, subtotal, delivery_fee) ON public.orders FROM authenticated;

-- Autoriser les plats personnalisés sur mesure à la table sans ID catalogue fixe
ALTER TABLE public.order_items
    ALTER COLUMN dish_id DROP NOT NULL,
    ADD COLUMN IF NOT EXISTS dish_name TEXT;

ALTER TABLE public.order_items
    DROP CONSTRAINT IF EXISTS chk_order_items_dish_or_name;
ALTER TABLE public.order_items
    ADD CONSTRAINT chk_order_items_dish_or_name
    CHECK (dish_id IS NOT NULL OR (dish_name IS NOT NULL AND length(trim(dish_name)) > 0));

-- 3. Table public.waiter_calls (Appels Serveur & Demandes Silencieuses en Salle)
CREATE TABLE IF NOT EXISTS public.waiter_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL DEFAULT 'Client en salle',
    table_number TEXT NOT NULL CHECK (length(trim(table_number)) > 0 AND length(table_number) <= 60),
    request_type TEXT NOT NULL DEFAULT 'call_waiter'
        CHECK (request_type IN ('call_waiter', 'silent_request', 'bill_request', 'water_cutlery', 'urgent_help')),
    message TEXT CHECK (message IS NULL OR length(message) <= 500),
    is_silent BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'acknowledged', 'served', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.waiter_calls ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_waiter_calls_restaurant_id ON public.waiter_calls(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_waiter_calls_customer_id ON public.waiter_calls(customer_id);
CREATE INDEX IF NOT EXISTS idx_waiter_calls_restaurant_status ON public.waiter_calls(restaurant_id, status, created_at DESC);

DROP TRIGGER IF EXISTS tr_waiter_calls_updated_at ON public.waiter_calls;
CREATE TRIGGER tr_waiter_calls_updated_at
    BEFORE UPDATE ON public.waiter_calls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Politiques RLS strictes pour waiter_calls
-- INSERT : client connecté ou invité sur place vers un restaurant actif proposant ce service,
-- sans possibilité d'usurper un autre customer_id.
DROP POLICY IF EXISTS "Un client en salle peut envoyer un appel serveur" ON public.waiter_calls;
CREATE POLICY "Un client en salle peut envoyer un appel serveur"
    ON public.waiter_calls FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        status = 'pending'
        AND (customer_id IS NULL OR customer_id = (select auth.uid()))
        AND EXISTS (
            SELECT 1 FROM public.restaurants r
            WHERE r.id = waiter_calls.restaurant_id
              AND r.is_active = true
              AND r.allows_waiter_call = true
        )
    );

-- SELECT : uniquement le restaurateur propriétaire ou le client authentifié émetteur
DROP POLICY IF EXISTS "Le restaurateur et l'émetteur authentifié voient les appels serveur" ON public.waiter_calls;
CREATE POLICY "Le restaurateur et l'émetteur authentifié voient les appels serveur"
    ON public.waiter_calls FOR SELECT
    TO authenticated
    USING (
        customer_id = (select auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.restaurants r
            WHERE r.id = waiter_calls.restaurant_id AND r.owner_id = (select auth.uid())
        )
    );

-- UPDATE : uniquement le restaurateur propriétaire
DROP POLICY IF EXISTS "Le restaurateur met à jour le statut des appels serveur" ON public.waiter_calls;
CREATE POLICY "Le restaurateur met à jour le statut des appels serveur"
    ON public.waiter_calls FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.restaurants r
            WHERE r.id = waiter_calls.restaurant_id AND r.owner_id = (select auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.restaurants r
            WHERE r.id = waiter_calls.restaurant_id AND r.owner_id = (select auth.uid())
        )
    );

-- 4. Table public.app_notifications (Notifications Temps Réel Restaurateur & Client)
CREATE TABLE IF NOT EXISTS public.app_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'new_dine_in_order',
        'new_delivery_order',
        'waiter_call',
        'silent_request',
        'order_status_update',
        'waiter_call_acknowledged',
        'system'
    )),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    table_number TEXT,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.app_notifications ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_app_notifications_recipient ON public.app_notifications(recipient_user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_notifications_restaurant ON public.app_notifications(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_app_notifications_order_id ON public.app_notifications(order_id);

DROP POLICY IF EXISTS "Un utilisateur lit uniquement ses propres notifications" ON public.app_notifications;
CREATE POLICY "Un utilisateur lit uniquement ses propres notifications"
    ON public.app_notifications FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = recipient_user_id);

DROP POLICY IF EXISTS "Un utilisateur marque ses notifications comme lues" ON public.app_notifications;
CREATE POLICY "Un utilisateur marque ses notifications comme lues"
    ON public.app_notifications FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = recipient_user_id)
    WITH CHECK ((select auth.uid()) = recipient_user_id);

REVOKE UPDATE ON public.app_notifications FROM authenticated;
GRANT UPDATE (is_read) ON public.app_notifications TO authenticated;

-- 5. Triggers Automatisés Sécurisés pour Notifications Temps Réel (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.notify_on_new_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_owner_id UUID;
    v_resto_name TEXT;
    v_notif_type TEXT;
    v_title TEXT;
    v_body TEXT;
BEGIN
    SELECT owner_id, name INTO v_owner_id, v_resto_name
    FROM public.restaurants
    WHERE id = NEW.restaurant_id;

    IF v_owner_id IS NOT NULL THEN
        IF NEW.order_type = 'dine_in' THEN
            v_notif_type := 'new_dine_in_order';
            v_title := 'Nouvelle commande en salle (' || COALESCE(NEW.table_number, 'Table') || ')';
            v_body := COALESCE(NEW.customer_name, 'Client') || ' • ' || NEW.total_amount || ' FCFA • À servir sous ' || COALESCE(NEW.estimated_serve_minutes, 20) || ' min.';
        ELSE
            v_notif_type := 'new_delivery_order';
            v_title := 'Nouvelle commande pour ' || COALESCE(v_resto_name, 'votre restaurant');
            v_body := COALESCE(NULLIF(trim(NEW.delivery_address), ''), 'Adresse à confirmer') || ' • ' || NEW.total_amount || ' FCFA.';
        END IF;

        INSERT INTO public.app_notifications (
            recipient_user_id,
            restaurant_id,
            type,
            title,
            body,
            table_number,
            order_id
        ) VALUES (
            v_owner_id,
            NEW.restaurant_id,
            v_notif_type,
            v_title,
            v_body,
            NEW.table_number,
            NEW.id
        );
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_notify_on_new_order ON public.orders;
CREATE TRIGGER tr_notify_on_new_order
    AFTER INSERT ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.notify_on_new_order();

CREATE OR REPLACE FUNCTION public.notify_on_waiter_call()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_owner_id UUID;
    v_title TEXT;
    v_body TEXT;
BEGIN
    SELECT owner_id INTO v_owner_id
    FROM public.restaurants
    WHERE id = NEW.restaurant_id;

    IF v_owner_id IS NOT NULL THEN
        IF NEW.request_type = 'silent_request' THEN
            v_title := 'Demande silencieuse • ' || NEW.table_number;
        ELSIF NEW.request_type = 'bill_request' THEN
            v_title := 'Addition demandée • ' || NEW.table_number;
        ELSIF NEW.request_type = 'water_cutlery' THEN
            v_title := 'Eau / Couverts • ' || NEW.table_number;
        ELSE
            v_title := 'Appel serveur • ' || NEW.table_number;
        END IF;

        v_body := COALESCE(NULLIF(trim(NEW.message), ''), 'Le client souhaite être servi à la ' || NEW.table_number || '.');

        INSERT INTO public.app_notifications (
            recipient_user_id,
            restaurant_id,
            type,
            title,
            body,
            table_number
        ) VALUES (
            v_owner_id,
            NEW.restaurant_id,
            CASE WHEN NEW.request_type = 'silent_request' THEN 'silent_request' ELSE 'waiter_call' END,
            v_title,
            v_body,
            NEW.table_number
        );
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_notify_on_waiter_call ON public.waiter_calls;
CREATE TRIGGER tr_notify_on_waiter_call
    AFTER INSERT ON public.waiter_calls
    FOR EACH ROW EXECUTE FUNCTION public.notify_on_waiter_call();

CREATE OR REPLACE FUNCTION public.notify_on_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_status_label TEXT;
BEGIN
    IF NEW.status IS DISTINCT FROM OLD.status AND NEW.customer_id IS NOT NULL THEN
        v_status_label := CASE NEW.status
            WHEN 'confirmed' THEN 'confirmée par le restaurant'
            WHEN 'preparing' THEN 'en cours de préparation en cuisine'
            WHEN 'ready_for_pickup' THEN CASE WHEN NEW.order_type = 'dine_in' THEN 'prête et en route vers votre table' ELSE 'prête pour la livraison' END
            WHEN 'delivered' THEN CASE WHEN NEW.order_type = 'dine_in' THEN 'servie à votre table' ELSE 'livrée avec succès' END
            WHEN 'cancelled' THEN 'annulée'
            ELSE NEW.status
        END;

        INSERT INTO public.app_notifications (
            recipient_user_id,
            restaurant_id,
            type,
            title,
            body,
            table_number,
            order_id
        ) VALUES (
            NEW.customer_id,
            NEW.restaurant_id,
            'order_status_update',
            'Mise à jour de votre commande',
            'Votre commande est maintenant ' || v_status_label || '.',
            NEW.table_number,
            NEW.id
        );
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_notify_on_order_status_change ON public.orders;
CREATE TRIGGER tr_notify_on_order_status_change
    AFTER UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.notify_on_order_status_change();

-- 6. RPC Atomiques Sécurisées (Intégrité Prix FCFA & Anti-Spam Appels Serveur)
CREATE OR REPLACE FUNCTION public.create_order_atomic(
    p_restaurant_id UUID,
    p_order_type TEXT,
    p_table_number TEXT,
    p_estimated_serve_minutes INTEGER,
    p_delivery_address TEXT,
    p_customer_name TEXT,
    p_customer_phone TEXT,
    p_payment_method TEXT,
    p_notes TEXT,
    p_items JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_uid UUID := (select auth.uid());
    v_order_id UUID;
    v_item JSONB;
    v_dish_id UUID;
    v_qty INTEGER;
    v_unit_price INTEGER;
    v_dish_name TEXT;
    v_subtotal INTEGER := 0;
    v_total_dishes INTEGER := 0;
    v_delivery_fee INTEGER := 0;
    v_total_amount INTEGER := 0;
    v_prep_minutes INTEGER;
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Authentification requise pour créer une commande.';
    END IF;

    IF p_items IS NULL OR jsonb_array_length(p_items) = 0 OR jsonb_array_length(p_items) > 100 THEN
        RAISE EXCEPTION 'Liste d''articles invalide.';
    END IF;

    IF p_order_type = 'dine_in' AND (p_table_number IS NULL OR length(trim(p_table_number)) = 0) THEN
        RAISE EXCEPTION 'Numéro de table obligatoire pour une commande sur place.';
    END IF;

    SELECT LEAST(GREATEST(COALESCE(p_estimated_serve_minutes, avg_prep_time_min, 20), 5), 180)
    INTO v_prep_minutes
    FROM public.restaurants
    WHERE id = p_restaurant_id AND is_active = true;

    IF v_prep_minutes IS NULL THEN
        RAISE EXCEPTION 'Restaurant introuvable ou inactif.';
    END IF;

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_qty := LEAST(GREATEST(COALESCE((v_item->>'quantity')::INTEGER, 1), 1), 50);
        v_dish_name := COALESCE(NULLIF(trim(v_item->>'dishName'), ''), 'Plat sur mesure');
        v_dish_id := NULL;
        IF COALESCE(v_item->>'dishId', '') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
            v_dish_id := (v_item->>'dishId')::UUID;
        END IF;

        IF v_dish_id IS NOT NULL THEN
            SELECT price, name INTO v_unit_price, v_dish_name
            FROM public.dishes
            WHERE id = v_dish_id AND restaurant_id = p_restaurant_id AND is_available = true;
            IF v_unit_price IS NULL THEN
                RAISE EXCEPTION 'Plat catalogue introuvable ou indisponible.';
            END IF;
        ELSE
            v_unit_price := LEAST(GREATEST(COALESCE((v_item->>'unitPrice')::INTEGER, 0), 0), 500000);
        END IF;

        v_subtotal := v_subtotal + (v_unit_price * v_qty);
        v_total_dishes := v_total_dishes + v_qty;
    END LOOP;

    IF p_order_type = 'dine_in' THEN
        v_delivery_fee := 0;
    ELSE
        IF v_total_dishes <= 2 THEN v_delivery_fee := 80;
        ELSIF v_total_dishes <= 5 THEN v_delivery_fee := 130;
        ELSIF v_total_dishes <= 10 THEN v_delivery_fee := 170;
        ELSE v_delivery_fee := 0;
        END IF;
    END IF;

    v_total_amount := v_subtotal + v_delivery_fee;

    INSERT INTO public.orders (
        customer_id, restaurant_id, status, order_type, table_number,
        estimated_serve_minutes, promised_ready_at, customer_name, customer_phone,
        subtotal, delivery_fee, total_amount, delivery_address,
        payment_method, payment_status, notes
    ) VALUES (
        v_uid, p_restaurant_id, 'pending', p_order_type, NULLIF(trim(p_table_number), ''),
        v_prep_minutes, NOW() + make_interval(mins => v_prep_minutes),
        COALESCE(NULLIF(trim(p_customer_name), ''), 'Client'), COALESCE(NULLIF(trim(p_customer_phone), ''), 'Sur place'),
        v_subtotal, v_delivery_fee, v_total_amount, COALESCE(NULLIF(trim(p_delivery_address), ''), 'Sur place'),
        p_payment_method, 'pending', NULLIF(trim(p_notes), '')
    )
    RETURNING id INTO v_order_id;

    INSERT INTO public.order_items (order_id, dish_id, dish_name, quantity, unit_price, customization_details)
    SELECT
        v_order_id,
        CASE WHEN COALESCE(it->>'dishId', '') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN (it->>'dishId')::UUID ELSE NULL END,
        COALESCE(NULLIF(trim(it->>'dishName'), ''), 'Plat sur mesure'),
        LEAST(GREATEST(COALESCE((it->>'quantity')::INTEGER, 1), 1), 50),
        COALESCE((SELECT d.price FROM public.dishes d WHERE d.id = (CASE WHEN COALESCE(it->>'dishId', '') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN (it->>'dishId')::UUID ELSE NULL END) AND d.restaurant_id = p_restaurant_id), LEAST(GREATEST(COALESCE((it->>'unitPrice')::INTEGER, 0), 0), 500000)),
        COALESCE(it->'customizationDetails', '{}'::jsonb)
    FROM jsonb_array_elements(p_items) AS it;

    RETURN v_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_order_atomic(UUID, TEXT, TEXT, INTEGER, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_order_atomic(UUID, TEXT, TEXT, INTEGER, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) TO authenticated;

CREATE OR REPLACE FUNCTION public.submit_waiter_call(
    p_restaurant_id UUID,
    p_table_number TEXT,
    p_request_type TEXT,
    p_message TEXT,
    p_customer_name TEXT,
    p_is_silent BOOLEAN
)
RETURNS public.waiter_calls
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_uid UUID := (select auth.uid());
    v_recent_count INTEGER;
    v_row public.waiter_calls;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.restaurants r
        WHERE r.id = p_restaurant_id AND r.is_active = true AND r.allows_waiter_call = true
    ) THEN
        RAISE EXCEPTION 'Service d''appel serveur indisponible pour ce restaurant.';
    END IF;

    SELECT COUNT(*) INTO v_recent_count
    FROM public.waiter_calls wc
    WHERE wc.restaurant_id = p_restaurant_id
      AND wc.table_number = trim(p_table_number)
      AND wc.status = 'pending'
      AND wc.created_at > NOW() - INTERVAL '5 minutes';

    IF v_recent_count >= 3 THEN
        RAISE EXCEPTION 'Un appel est déjà en cours de traitement pour votre table.';
    END IF;

    INSERT INTO public.waiter_calls (
        restaurant_id, customer_id, customer_name, table_number, request_type, message, is_silent, status
    ) VALUES (
        p_restaurant_id,
        v_uid,
        COALESCE(NULLIF(trim(p_customer_name), ''), 'Client en salle'),
        trim(p_table_number),
        p_request_type,
        NULLIF(trim(p_message), ''),
        COALESCE(p_is_silent, true),
        'pending'
    )
    RETURNING * INTO v_row;

    RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_waiter_call(UUID, TEXT, TEXT, TEXT, TEXT, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_waiter_call(UUID, TEXT, TEXT, TEXT, TEXT, BOOLEAN) TO anon, authenticated;

-- 7. Activation idempotente du Temps Réel sur les nouvelles tables
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'waiter_calls'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.waiter_calls;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'app_notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.app_notifications;
    END IF;
END
$$;

-- 8. Durcissement final des fonctions triggers & search_path (Zero-Trust Advisors)
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.promote_owner_role() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_on_new_order() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_on_waiter_call() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_on_order_status_change() FROM PUBLIC, anon, authenticated;
