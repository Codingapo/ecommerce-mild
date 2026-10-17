export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  image_url: string;
  active: boolean;
  featured: boolean;
  created_at: string;
  images: string[];
  stock: number;
  low_stock_threshold: number;
};
export type Category = { slug: string; name: string };
export type Account = { user_id: string; role: "customer" | "admin" };
export type Profile = {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  address: Json;
  created_at: string;
};
export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "on_hold";
export type Order = {
  id: string;
  user_id: string;
  reference: string;
  status: OrderStatus;
  payment_status: "pending" | "paid";
  total: number;
  currency: string;
  email: string;
  shipping_address: Json;
  created_at: string;
  paid_at: string | null;
  idempotency_key: string;
  request_hash: string;
  authorization_url: string | null;
  paystack_id: string | null;
  order_number: number;
  stock_deducted: boolean;
};
export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  name: string;
  quantity: number;
  unit_price: number;
};
export type OrderDetail = Order & { order_items: OrderItem[] };
export type Outbox = {
  id: string;
  order_id: string;
  kind: string;
  sent_at: string | null;
  attempts: number;
  lease_until: string | null;
  created_at: string;
};
type Table<T> = {
  Row: T;
  Insert: Partial<T>;
  Update: Partial<T>;
  Relationships: [];
};
export type Database = {
  public: {
    Tables: {
      products: Table<Product>;
      categories: Table<Category>;
      accounts: Table<Account>;
      profiles: Table<Profile>;
      orders: Table<Order>;
      order_items: Table<OrderItem>;
      email_outbox: Table<Outbox>;
    };
    Views: Record<string, never>;
    Functions: {
      search_products: {
        Args: { p_query: string; p_category: string };
        Returns: Product[];
      };
      create_checkout: {
        Args: {
          p_user: string;
          p_email: string;
          p_lines: Json;
          p_address: Json;
          p_key: string;
          p_hash: string;
          p_currency: string;
        };
        Returns: Order;
      };
      complete_payment: {
        Args: {
          p_reference: string;
          p_amount: number;
          p_currency: string;
          p_transaction: string;
        };
        Returns: Order;
      };
      change_order_status: {
        Args: { p_order: string; p_status: string };
        Returns: Order;
      };
      consume_limit: {
        Args: { p_key: string; p_max: number; p_seconds: number };
        Returns: boolean;
      };
      claim_emails: { Args: { p_limit: number }; Returns: Outbox[] };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
