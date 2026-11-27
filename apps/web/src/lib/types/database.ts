export type UserRole = "customer" | "restaurant_owner" | "courier" | "admin";

export type RestaurantSalesMode = "online_only" | "dine_in_only" | "hybrid";

export type OrderType = "delivery" | "pickup" | "dine_in";

export type WaiterCallType =
  | "call_waiter"
  | "silent_request"
  | "bill_request"
  | "water_cutlery"
  | "urgent_help";

export type WaiterCallStatus = "pending" | "acknowledged" | "served" | "cancelled";

export type AppNotificationType =
  | "new_dine_in_order"
  | "new_delivery_order"
  | "waiter_call"
  | "silent_request"
  | "order_status_update"
  | "waiter_call_acknowledged"
  | "system";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  role: UserRole;
  avatar_url?: string;
  wallet_balance?: number;
  created_at: string;
}

export interface RestaurantEntity {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  banner_url: string;
  phone_number: string;
  address: string;
  category: string;
  rating: number;
  reviews_count: number;
  delivery_time: string;
  delivery_fee_base: string;
  is_open: boolean;
  is_verified: boolean;
  open_time?: string;
  close_time?: string;
  sales_mode?: RestaurantSalesMode;
  tables_count?: number;
  table_zones?: string[];
  avg_prep_time_min?: number;
  allows_dine_in_composition?: boolean;
  allows_waiter_call?: boolean;
  accepts_cash_on_site?: boolean;
  created_at: string;
}

export interface CreateRestaurantParams {
  ownerId: string;
  name: string;
  category: string;
  address: string;
  phoneNumber: string;
  description?: string;
  openTime?: string;
  closeTime?: string;
  logoUrl?: string;
  bannerUrl?: string;
  salesMode?: RestaurantSalesMode;
  tablesCount?: number;
  tableZones?: string[];
  avgPrepTimeMin?: number;
  allowsDineInComposition?: boolean;
  allowsWaiterCall?: boolean;
  acceptsCashOnSite?: boolean;
}

export interface DishEntity {
  id: string;
  restaurant_id: string;
  category_id?: string;
  name: string;
  description: string;
  price: number; // en FCFA
  original_price?: number;
  image_url: string;
  is_available: boolean;
  is_free_eligible: boolean;
  allows_customization: boolean;
  prep_time_min: number;
  created_at: string;
}

export type OrderStatus =
  | "pending" // En attente d'acceptation par le restaurateur
  | "confirmed" // Acceptée
  | "preparing" // En cuisine
  | "ready_for_pickup" // Prête pour le coursier ou service en salle
  | "delivering" // En cours de livraison
  | "delivered" // Livrée / Servie au client
  | "cancelled"; // Annulée

export interface OrderItemEntity {
  id: string;
  order_id: string;
  dish_id?: string | null;
  dish_name: string;
  quantity: number;
  unit_price: number; // en FCFA
  total_price: number; // en FCFA
  customization_details?: Record<string, string | number | boolean>;
}

export interface OrderEntity {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  restaurant_id: string;
  restaurant_name: string;
  courier_id?: string;
  status: OrderStatus;
  order_type?: OrderType;
  table_number?: string;
  estimated_serve_minutes?: number;
  promised_ready_at?: string;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  delivery_address: string;
  payment_method: "mobile_money" | "cash_on_delivery" | "card";
  payment_status: "pending" | "paid" | "failed";
  notes?: string;
  scheduled_for?: string;
  created_at: string;
  updated_at: string;
  items: OrderItemEntity[];
}

export interface WaiterCallEntity {
  id: string;
  restaurant_id: string;
  restaurant_name?: string;
  customer_id?: string | null;
  customer_name: string;
  table_number: string;
  request_type: WaiterCallType;
  message?: string;
  is_silent: boolean;
  status: WaiterCallStatus;
  created_at: string;
  updated_at: string;
}

export interface AppNotificationEntity {
  id: string;
  recipient_user_id: string;
  restaurant_id?: string | null;
  type: AppNotificationType;
  title: string;
  body: string;
  table_number?: string | null;
  order_id?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface RestaurantKPIs {
  today_revenue_fcfa: number;
  today_orders_count: number;
  pending_orders_count: number;
  avg_prep_time_min: number;
  rating: number;
  active_dishes_count: number;
  dine_in_orders_count?: number;
  pending_waiter_calls_count?: number;
}
