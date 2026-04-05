export type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  whatsapp_number: string | null
  university: string | null
  campus: string | null
  bio: string | null
  is_seller: boolean
  seller_verified: boolean
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
