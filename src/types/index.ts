export type UserRole =
  | 'student'
  | 'vendor'
  | 'rider'
  | 'university_admin'
  | 'super_admin'

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'confirmed'
  | 'rider_assigned'
  | 'picked_up'
  | 'delivered'
  | 'completed'
  | 'disputed'
  | 'cancelled'
  | 'refunded'

export type VendorStatus =
  | 'pending'
  | 'approved'
  | 'suspended'
  | 'rejected'

export type DeliveryStatus =
  | 'pending'
  | 'assigned'
  | 'at_vendor'
  | 'picked_up'
  | 'delivered'
  | 'failed'

export type PaymentStatus =
  | 'pending'
  | 'held'
  | 'released'
  | 'refunded'
  | 'failed'

export type DisputeStatus =
  | 'open'
  | 'under_review'
  | 'resolved_refund'
  | 'resolved_release'
  | 'closed'

export interface University {
  id: string
  name: string
  slug: string
  short_name: string
  city: string
  state: string
  is_active: boolean
}

export interface Profile {
  id: string
  university_id: string
  full_name: string
  phone: string | null
  avatar_url: string | null
  role: UserRole
  is_verified: boolean
  is_active: boolean
  matric_number: string | null
  created_at: string
}

export interface Vendor {
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
  status: VendorStatus
  rating: number
  total_ratings: number
  is_open: boolean
  created_at: string
}

export interface Product {
  id: string
  vendor_id: string
  university_id: string
  name: string
  description: string | null
  price: number
  compare_price: number | null
  stock_qty: number
  category: string
  images: string[]
  status: string
  is_featured: boolean
  rating: number
  total_ratings: number
  created_at: string
}

export interface ProductWithVendor extends Product {
  vendor_id: string
  business_name: string
  vendor_logo: string | null
  vendor_rating: number
  vendor_is_open: boolean
  vendor_address: string | null
}

export interface Order {
  id: string
  student_id: string
  vendor_id: string
  university_id: string
  status: OrderStatus
  subtotal: number
  delivery_fee: number
  discount: number
  total_amount: number
  delivery_address: string
  delivery_note: string | null
  fraud_score: number | null
  fraud_flag: boolean
  created_at: string
  confirmed_at: string | null
  delivered_at: string | null
  completed_at: string | null
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface OrderWithDetails extends Order {
  vendor_name: string
  vendor_logo: string | null
  delivery_status: DeliveryStatus | null
  pickup_photo_url: string | null
  rider_id: string | null
  payment_status: PaymentStatus | null
  paystack_ref: string | null
}

export interface Delivery {
  id: string
  order_id: string
  rider_id: string | null
  university_id: string
  status: DeliveryStatus
  pickup_photo_url: string | null
  pickup_photo_at: string | null
  last_lat: number | null
  last_lng: number | null
  assigned_at: string | null
  picked_up_at: string | null
  delivered_at: string | null
  estimated_minutes: number | null
}

export interface Payment {
  id: string
  order_id: string
  student_id: string
  vendor_id: string
  paystack_ref: string | null
  amount: number
  platform_fee: number
  vendor_amount: number
  delivery_fee: number
  status: PaymentStatus
  paid_at: string | null
  released_at: string | null
}

export interface Dispute {
  id: string
  order_id: string
  raised_by: string
  university_id: string
  reason: string
  evidence_urls: string[]
  classifier_score: number | null
  classifier_recommendation: string | null
  status: DisputeStatus
  resolved_by: string | null
  resolution_note: string | null
  resolved_at: string | null
  created_at: string
}

export interface CartItemProduct {
  id: string
  name: string
  price: number
  compare_price: number | null
  images: string[]
  vendor_id: string
  vendor: {
    business_name: string
    is_open: boolean
  } | null
}

export interface CartItem {
  id: string
  student_id: string
  product_id: string
  university_id: string
  quantity: number
  created_at: string
  product?: CartItemProduct | null
}

export interface Rating {
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

export interface Notification {
  id: string
  user_id: string
  university_id: string
  type: string
  title: string
  body: string
  data: Record<string, unknown>
  is_read: boolean
  created_at: string
}

export interface VendorDashboardStats {
  vendor_id: string
  business_name: string
  university_id: string
  rating: number
  status: VendorStatus
  total_orders: number
  pending_orders: number
  completed_orders: number
  total_revenue: number
  total_products: number
  out_of_stock_count: number
}

export interface MLFraudScore {
  score: number
  flag: boolean
  action: 'approve' | 'review' | 'block'
}

export interface MLRecommendation {
  product_id: string
  score: number
}

export interface MLDisputeScore {
  score: number
  recommendation: 'refund' | 'release' | 'review'
  confidence: number
}

export interface MLForecastPoint {
  date: string
  predicted_orders: number
  lower_bound: number
  upper_bound: number
}
