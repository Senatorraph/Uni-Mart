import { createContext, useContext, ReactNode } from 'react'
import { useCart } from '@/hooks/useCart'
import { CartItem } from '@/types'

interface CartContextType {
  cartItems: CartItem[]
  cartCount: number
  cartTotal: number
  loading: boolean
  addToCart: (productId: string, quantity?: number) => Promise<{ error: string | null }>
  updateQuantity: (cartItemId: string, quantity: number) => Promise<{ error: string | null }>
  removeFromCart: (cartItemId: string) => Promise<{ error: string | null }>
  clearCart: () => Promise<void>
  refetch: () => Promise<void>
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useCart()

  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>
}

export function useCartContext() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCartContext must be used within CartProvider')
  return context
}
