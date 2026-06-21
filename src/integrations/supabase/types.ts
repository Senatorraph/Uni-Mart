export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  __InternalSupabase: { PostgrestVersion: "12" }
  public: {
    Tables: {
      payments: {
        Row: {
          id: string
          order_id: string
          university_id: string
          student_id: string
          vendor_id: string
          paystack_ref: string | null
          paystack_id: string | null
          amount: number
          platform_fee: number
          vendor_amount: number
          delivery_fee: number
          status: "pending" | "held" | "released" | "refunded" | "failed"
          paid_at: string | null
          released_at: string | null
          refunded_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          university_id: string
          student_id: string
          vendor_id: string
          paystack_ref?: string | null
          paystack_id?: string | null
          amount: number
          platform_fee: number
          vendor_amount: number
          delivery_fee: number
          status: "pending" | "held" | "released" | "refunded" | "failed"
          paid_at?: string | null
          released_at?: string | null
          refunded_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          university_id?: string
          student_id?: string
          vendor_id?: string
          paystack_ref?: string | null
          paystack_id?: string | null
          amount?: number
          platform_fee?: number
          vendor_amount?: number
          delivery_fee?: number
          status?: "pending" | "held" | "released" | "refunded" | "failed"
          paid_at?: string | null
          released_at?: string | null
          refunded_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      ml_events: {
        Row: {
          id: string
          event_type: string
          entity_id: string
          university_id: string | null
          payload: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          event_type: string
          entity_id: string
          university_id?: string | null
          payload?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          event_type?: string
          entity_id?: string
          university_id?: string | null
          payload?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          id: string
          user_id: string
          university_id: string
          business_name: string
          description: string | null
          category: string
          banner_url: string | null
          logo_url: string | null
          whatsapp: string | null
          address: string | null
          status: "pending" | "approved" | "suspended" | "rejected"
          rating: number | null
          total_ratings: number
          is_open: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          university_id: string
          business_name: string
          description?: string | null
          category: string
          banner_url?: string | null
          logo_url?: string | null
          whatsapp?: string | null
          address?: string | null
          status: "pending" | "approved" | "suspended" | "rejected"
          rating?: number | null
          total_ratings: number
          is_open: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          university_id?: string
          business_name?: string
          description?: string | null
          category?: string
          banner_url?: string | null
          logo_url?: string | null
          whatsapp?: string | null
          address?: string | null
          status?: "pending" | "approved" | "suspended" | "rejected"
          rating?: number | null
          total_ratings?: number
          is_open?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          student_id: string
          vendor_id: string
          university_id: string
          status: "pending" | "paid" | "confirmed" | "rider_assigned" | "picked_up" | "delivered" | "completed" | "disputed" | "cancelled" | "refunded"
          subtotal: number
          delivery_fee: number
          discount: number
          total_amount: number
          delivery_address: string
          delivery_note: string | null
          fraud_score: number | null
          fraud_flag: boolean
          created_at: string
          updated_at: string
          confirmed_at: string | null
          delivered_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          student_id: string
          vendor_id: string
          university_id: string
          status: "pending" | "paid" | "confirmed" | "rider_assigned" | "picked_up" | "delivered" | "completed" | "disputed" | "cancelled" | "refunded"
          subtotal: number
          delivery_fee: number
          discount: number
          total_amount: number
          delivery_address: string
          delivery_note?: string | null
          fraud_score?: number | null
          fraud_flag: boolean
          created_at?: string
          updated_at?: string
          confirmed_at?: string | null
          delivered_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          vendor_id?: string
          university_id?: string
          status?: "pending" | "paid" | "confirmed" | "rider_assigned" | "picked_up" | "delivered" | "completed" | "disputed" | "cancelled" | "refunded"
          subtotal?: number
          delivery_fee?: number
          discount?: number
          total_amount?: number
          delivery_address?: string
          delivery_note?: string | null
          fraud_score?: number | null
          fraud_flag?: boolean
          created_at?: string
          updated_at?: string
          confirmed_at?: string | null
          delivered_at?: string | null
          completed_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          university_id: string | null
          full_name: string
          phone: string | null
          avatar_url: string | null
          role: "student" | "vendor" | "rider" | "university_admin" | "super_admin"
          is_verified: boolean
          is_active: boolean
          matric_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          university_id?: string | null
          full_name: string
          phone?: string | null
          avatar_url?: string | null
          role: "student" | "vendor" | "rider" | "university_admin" | "super_admin"
          is_verified: boolean
          is_active: boolean
          matric_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          university_id?: string | null
          full_name?: string
          phone?: string | null
          avatar_url?: string | null
          role?: "student" | "vendor" | "rider" | "university_admin" | "super_admin"
          is_verified?: boolean
          is_active?: boolean
          matric_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      deliveries: {
        Row: {
          id: string
          order_id: string
          rider_id: string | null
          university_id: string
          status: "pending" | "assigned" | "at_vendor" | "picked_up" | "delivered" | "failed"
          pickup_photo_url: string | null
          pickup_photo_at: string | null
          last_lat: number | null
          last_lng: number | null
          last_location_at: string | null
          assigned_at: string | null
          picked_up_at: string | null
          delivered_at: string | null
          estimated_minutes: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          rider_id?: string | null
          university_id: string
          status: "pending" | "assigned" | "at_vendor" | "picked_up" | "delivered" | "failed"
          pickup_photo_url?: string | null
          pickup_photo_at?: string | null
          last_lat?: number | null
          last_lng?: number | null
          last_location_at?: string | null
          assigned_at?: string | null
          picked_up_at?: string | null
          delivered_at?: string | null
          estimated_minutes?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          rider_id?: string | null
          university_id?: string
          status?: "pending" | "assigned" | "at_vendor" | "picked_up" | "delivered" | "failed"
          pickup_photo_url?: string | null
          pickup_photo_at?: string | null
          last_lat?: number | null
          last_lng?: number | null
          last_location_at?: string | null
          assigned_at?: string | null
          picked_up_at?: string | null
          delivered_at?: string | null
          estimated_minutes?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      ml_predictions: {
        Row: {
          id: string
          model_name: string
          entity_id: string
          university_id: string | null
          input_features: Json | null
          prediction_value: string
          confidence: number | null
          created_at: string
        }
        Insert: {
          id?: string
          model_name: string
          entity_id: string
          university_id?: string | null
          input_features?: Json | null
          prediction_value: string
          confidence?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          model_name?: string
          entity_id?: string
          university_id?: string | null
          input_features?: Json | null
          prediction_value?: string
          confidence?: number | null
          created_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          vendor_id: string
          university_id: string
          name: string
          description: string | null
          price: number
          compare_price: number | null
          stock_qty: number
          category: string
          images: (string)[]
          status: "active" | "out_of_stock" | "hidden"
          is_featured: boolean
          rating: number | null
          total_ratings: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          university_id: string
          name: string
          description?: string | null
          price: number
          compare_price?: number | null
          stock_qty: number
          category: string
          images: (string)[]
          status: "active" | "out_of_stock" | "hidden"
          is_featured: boolean
          rating?: number | null
          total_ratings: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          university_id?: string
          name?: string
          description?: string | null
          price?: number
          compare_price?: number | null
          stock_qty?: number
          category?: string
          images?: (string)[]
          status?: "active" | "out_of_stock" | "hidden"
          is_featured?: boolean
          rating?: number | null
          total_ratings?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_product_feed: {
        Row: {
          id: string | null
          name: string | null
          description: string | null
          price: number | null
          compare_price: number | null
          stock_qty: number | null
          category: string | null
          images: (string)[] | null
          rating: number | null
          total_ratings: number | null
          is_featured: boolean | null
          university_id: string | null
          vendor_id: string | null
          business_name: string | null
          vendor_logo: string | null
          vendor_rating: number | null
          vendor_is_open: boolean | null
          vendor_address: string | null
        }
        Insert: {
          id?: string | null
          name?: string | null
          description?: string | null
          price?: number | null
          compare_price?: number | null
          stock_qty?: number | null
          category?: string | null
          images?: (string)[] | null
          rating?: number | null
          total_ratings?: number | null
          is_featured?: boolean | null
          university_id?: string | null
          vendor_id?: string | null
          business_name?: string | null
          vendor_logo?: string | null
          vendor_rating?: number | null
          vendor_is_open?: boolean | null
          vendor_address?: string | null
        }
        Update: {
          id?: string | null
          name?: string | null
          description?: string | null
          price?: number | null
          compare_price?: number | null
          stock_qty?: number | null
          category?: string | null
          images?: (string)[] | null
          rating?: number | null
          total_ratings?: number | null
          is_featured?: boolean | null
          university_id?: string | null
          vendor_id?: string | null
          business_name?: string | null
          vendor_logo?: string | null
          vendor_rating?: number | null
          vendor_is_open?: boolean | null
          vendor_address?: string | null
        }
        Relationships: []
      }
      ml_feedback: {
        Row: {
          id: string
          prediction_id: string | null
          model_name: string
          actual_outcome: string
          feedback_source: string
          created_at: string
        }
        Insert: {
          id?: string
          prediction_id?: string | null
          model_name: string
          actual_outcome: string
          feedback_source: string
          created_at?: string
        }
        Update: {
          id?: string
          prediction_id?: string | null
          model_name?: string
          actual_outcome?: string
          feedback_source?: string
          created_at?: string
        }
        Relationships: []
      }
      ml_models: {
        Row: {
          id: string
          model_name: string
          version: string
          accuracy_score: number | null
          metrics: Json | null
          is_active: boolean
          trained_at: string
          created_at: string
        }
        Insert: {
          id?: string
          model_name: string
          version: string
          accuracy_score?: number | null
          metrics?: Json | null
          is_active: boolean
          trained_at: string
          created_at?: string
        }
        Update: {
          id?: string
          model_name?: string
          version?: string
          accuracy_score?: number | null
          metrics?: Json | null
          is_active?: boolean
          trained_at?: string
          created_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          subtotal: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          subtotal: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          subtotal?: number
          created_at?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          id: string
          student_id: string
          product_id: string
          university_id: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          product_id: string
          university_id: string
          quantity: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          product_id?: string
          university_id?: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          id: string
          order_id: string
          reviewer_id: string
          university_id: string
          vendor_id: string | null
          product_id: string | null
          rider_id: string | null
          vendor_rating: number | null
          product_rating: number | null
          rider_rating: number | null
          review_text: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          reviewer_id: string
          university_id: string
          vendor_id?: string | null
          product_id?: string | null
          rider_id?: string | null
          vendor_rating?: number | null
          product_rating?: number | null
          rider_rating?: number | null
          review_text?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          reviewer_id?: string
          university_id?: string
          vendor_id?: string | null
          product_id?: string | null
          rider_id?: string | null
          vendor_rating?: number | null
          product_rating?: number | null
          rider_rating?: number | null
          review_text?: string | null
          created_at?: string
        }
        Relationships: []
      }
      vendor_boosts: {
        Row: {
          id: string
          vendor_id: string
          product_id: string | null
          university_id: string
          boost_type: string
          starts_at: string
          ends_at: string
          amount_paid: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          product_id?: string | null
          university_id: string
          boost_type: string
          starts_at: string
          ends_at: string
          amount_paid: number
          is_active: boolean
          created_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          product_id?: string | null
          university_id?: string
          boost_type?: string
          starts_at?: string
          ends_at?: string
          amount_paid?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      vendor_dashboard: {
        Row: {
          vendor_id: string | null
          business_name: string | null
          university_id: string | null
          rating: number | null
          status: "pending" | "approved" | "suspended" | "rejected" | null
          total_orders: number | null
          pending_orders: number | null
          completed_orders: number | null
          total_revenue: number | null
          total_products: number | null
          out_of_stock_count: number | null
        }
        Insert: {
          vendor_id?: string | null
          business_name?: string | null
          university_id?: string | null
          rating?: number | null
          status?: "pending" | "approved" | "suspended" | "rejected" | null
          total_orders?: number | null
          pending_orders?: number | null
          completed_orders?: number | null
          total_revenue?: number | null
          total_products?: number | null
          out_of_stock_count?: number | null
        }
        Update: {
          vendor_id?: string | null
          business_name?: string | null
          university_id?: string | null
          rating?: number | null
          status?: "pending" | "approved" | "suspended" | "rejected" | null
          total_orders?: number | null
          pending_orders?: number | null
          completed_orders?: number | null
          total_revenue?: number | null
          total_products?: number | null
          out_of_stock_count?: number | null
        }
        Relationships: []
      }
      universities: {
        Row: {
          id: string
          name: string
          slug: string
          short_name: string
          logo_url: string | null
          city: string
          state: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          short_name: string
          logo_url?: string | null
          city: string
          state: string
          is_active: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          short_name?: string
          logo_url?: string | null
          city?: string
          state?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_summary: {
        Row: {
          id: string | null
          status: "pending" | "paid" | "confirmed" | "rider_assigned" | "picked_up" | "delivered" | "completed" | "disputed" | "cancelled" | "refunded" | null
          total_amount: number | null
          delivery_address: string | null
          created_at: string | null
          delivered_at: string | null
          university_id: string | null
          student_id: string | null
          vendor_name: string | null
          vendor_logo: string | null
          delivery_status: "pending" | "assigned" | "at_vendor" | "picked_up" | "delivered" | "failed" | null
          pickup_photo_url: string | null
          rider_id: string | null
          payment_status: "pending" | "held" | "released" | "refunded" | "failed" | null
          paystack_ref: string | null
        }
        Insert: {
          id?: string | null
          status?: "pending" | "paid" | "confirmed" | "rider_assigned" | "picked_up" | "delivered" | "completed" | "disputed" | "cancelled" | "refunded" | null
          total_amount?: number | null
          delivery_address?: string | null
          created_at?: string | null
          delivered_at?: string | null
          university_id?: string | null
          student_id?: string | null
          vendor_name?: string | null
          vendor_logo?: string | null
          delivery_status?: "pending" | "assigned" | "at_vendor" | "picked_up" | "delivered" | "failed" | null
          pickup_photo_url?: string | null
          rider_id?: string | null
          payment_status?: "pending" | "held" | "released" | "refunded" | "failed" | null
          paystack_ref?: string | null
        }
        Update: {
          id?: string | null
          status?: "pending" | "paid" | "confirmed" | "rider_assigned" | "picked_up" | "delivered" | "completed" | "disputed" | "cancelled" | "refunded" | null
          total_amount?: number | null
          delivery_address?: string | null
          created_at?: string | null
          delivered_at?: string | null
          university_id?: string | null
          student_id?: string | null
          vendor_name?: string | null
          vendor_logo?: string | null
          delivery_status?: "pending" | "assigned" | "at_vendor" | "picked_up" | "delivered" | "failed" | null
          pickup_photo_url?: string | null
          rider_id?: string | null
          payment_status?: "pending" | "held" | "released" | "refunded" | "failed" | null
          paystack_ref?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          university_id: string
          type: "order_placed" | "order_confirmed" | "rider_assigned" | "order_picked_up" | "order_delivered" | "dispute_filed" | "dispute_resolved" | "payment_released" | "fraud_flagged" | "vendor_approved" | "low_stock_alert" | "demand_forecast_ready"
          title: string
          body: string
          data: Json | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          university_id: string
          type: "order_placed" | "order_confirmed" | "rider_assigned" | "order_picked_up" | "order_delivered" | "dispute_filed" | "dispute_resolved" | "payment_released" | "fraud_flagged" | "vendor_approved" | "low_stock_alert" | "demand_forecast_ready"
          title: string
          body: string
          data?: Json | null
          is_read: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          university_id?: string
          type?: "order_placed" | "order_confirmed" | "rider_assigned" | "order_picked_up" | "order_delivered" | "dispute_filed" | "dispute_resolved" | "payment_released" | "fraud_flagged" | "vendor_approved" | "low_stock_alert" | "demand_forecast_ready"
          title?: string
          body?: string
          data?: Json | null
          is_read?: boolean
          created_at?: string
        }
        Relationships: []
      }
      disputes: {
        Row: {
          id: string
          order_id: string
          raised_by: string
          university_id: string
          reason: string
          evidence_urls: (string)[] | null
          classifier_score: number | null
          classifier_recommendation: string | null
          status: "open" | "under_review" | "resolved_refund" | "resolved_release" | "closed"
          resolved_by: string | null
          resolution_note: string | null
          resolved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          raised_by: string
          university_id: string
          reason: string
          evidence_urls?: (string)[] | null
          classifier_score?: number | null
          classifier_recommendation?: string | null
          status: "open" | "under_review" | "resolved_refund" | "resolved_release" | "closed"
          resolved_by?: string | null
          resolution_note?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          raised_by?: string
          university_id?: string
          reason?: string
          evidence_urls?: (string)[] | null
          classifier_score?: number | null
          classifier_recommendation?: string | null
          status?: "open" | "under_review" | "resolved_refund" | "resolved_release" | "closed"
          resolved_by?: string | null
          resolution_note?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  T extends keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][T] extends { Row: infer R } ? R : never

export type TablesInsert<
  T extends keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][T] extends { Insert: infer I } ? I : never

export type TablesUpdate<
  T extends keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][T] extends { Update: infer U } ? U : never

export type Enums<T extends keyof DefaultSchema["Enums"]> = DefaultSchema["Enums"][T]

export const Constants = { public: { Enums: {} } } as const
