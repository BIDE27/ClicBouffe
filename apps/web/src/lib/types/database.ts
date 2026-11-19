export type UserRole = "customer" | "restaurant_owner" | "courier" | "admin";

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
  | "ready_for_pickup" // Prête pour le coursier
  | "delivering" // En cours de livraison
  | "delivered" // Livrée au client
  | "cancelled"; // Annulée

export interface OrderItemEntity {
  id: string;
  order_id: string;
  dish_id: string;
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

export interface RestaurantKPIs {
  today_revenue_fcfa: number;
  today_orders_count: number;
  pending_orders_count: number;
  avg_prep_time_min: number;
  rating: number;
  active_dishes_count: number;
}
