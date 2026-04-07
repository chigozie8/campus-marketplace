export type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  whatsapp_number: string | null
  instagram_handle: string | null
  facebook_handle: string | null
  university: string | null
  campus: string | null
  bio: string | null
  is_seller: boolean
  seller_verified: boolean
  is_student_verified: boolean
  rating: number
  total_sales: number
  created_at: string
  updated_at: string
}

export type Category = {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
  created_at: string
}

export type Product = {
  id: string
  seller_id: string
  category_id: string | null
  title: string
  description: string | null
  price: number
  original_price: number | null
  delivery_fee: number | null
  currency: string
  condition: 'new' | 'like_new' | 'good' | 'fair'
  images: string[]
  location: string | null
  campus: string | null
  is_available: boolean
  is_featured: boolean
  views: number
  whatsapp_clicks: number
  created_at: string
  updated_at: string
  profiles?: Profile
  categories?: Category
}

export type Favorite = {
  id: string
  user_id: string
  product_id: string
  created_at: string
  products?: Product
}

export type Review = {
  id: string
  product_id: string
  reviewer_id: string
  seller_id: string
  rating: number
  comment: string | null
  created_at: string
  profiles?: Profile
}

export type Message = {
  id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export type Platform = 'whatsapp' | 'instagram' | 'facebook'

export type Conversation = {
  id: string
  platform: Platform
  customer_name: string
  customer_phone?: string
  customer_avatar?: string
  last_message: string
  last_message_at: string
  unread_count: number
  messages: ChatMessage[]
}

export type ChatMessage = {
  id: string
  conversation_id: string
  direction: 'incoming' | 'outgoing'
  content: string
  created_at: string
  platform: Platform
}

export type Order = {
  id: string
  buyer_id: string
  seller_id: string
  product_id: string
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'completed' | 'cancelled'
  amount: number
  currency: string
  notes?: string | null
  created_at: string
  updated_at: string
  products?: Pick<Product, 'id' | 'title' | 'images' | 'price'>
  buyer_profile?: Pick<Profile, 'full_name' | 'avatar_url'>
}
