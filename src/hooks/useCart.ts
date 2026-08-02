import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { CartItem } from '@/types'

export function useCart() {
  const { profile } = useAuth()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.id) return

    fetchCart()

    const sub = supabase
      .channel(`cart-${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: `student_id=eq.${profile.id}`,
        },
        (payload) => {
          console.log('Cart realtime event:', payload.eventType)
          // UPDATE and DELETE are handled optimistically — only INSERT needs a refetch
          // (to pull in the nested product/vendor data for the new row).
          if (payload.eventType === 'INSERT') {
            fetchCart()
          }
        },
      )
      .subscribe((status) => {
        console.log('Cart subscription status:', status)
      })

    return () => {
      supabase.removeChannel(sub)
    }
  }, [profile?.id])

  async function fetchCart() {
    if (!profile?.id) return

    const { data, error } = await supabase
      .from('cart_items')
      .select(
        `
        id,
        student_id,
        product_id,
        university_id,
        quantity,
        created_at,
        product:products(
          id, name, price, compare_price, images, vendor_id,
          vendor:vendors(business_name, is_open)
        )
      `,
      )
      .eq('student_id', profile.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setCartItems(data as unknown as CartItem[])
    }
    setLoading(false)
  }

  async function addToCart(productId: string, quantity: number = 1) {
    if (!profile?.id || !profile?.university_id) return { error: 'Not logged in' }

    const existing = cartItems.find((item) => item.product_id === productId)

    if (existing) {
      // Optimistic update — update local state immediately
      setCartItems((prev) =>
        prev.map((item) => (item.id === existing.id ? { ...item, quantity: item.quantity + quantity } : item)),
      )

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)

      if (error) {
        // Revert on error
        setCartItems((prev) =>
          prev.map((item) => (item.id === existing.id ? { ...item, quantity: existing.quantity } : item)),
        )
        return { error: error.message }
      }

      return { error: null }
    }

    // New item — insert and select the full row (with nested product/vendor data)
    // so we can add it to local state immediately without a separate refetch.
    const { data, error } = await supabase
      .from('cart_items')
      .insert({
        student_id: profile.id,
        product_id: productId,
        university_id: profile.university_id,
        quantity,
      })
      .select(
        `
        id,
        student_id,
        product_id,
        university_id,
        quantity,
        created_at,
        product:products(
          id, name, price, compare_price, images, vendor_id,
          vendor:vendors(business_name, is_open)
        )
      `,
      )
      .single()

    if (error) return { error: error.message }

    if (data) {
      setCartItems((prev) => [data as unknown as CartItem, ...prev])
    }

    return { error: null }
  }

  async function updateQuantity(cartItemId: string, quantity: number) {
    if (quantity < 1) {
      return removeFromCart(cartItemId)
    }

    // Optimistic update
    setCartItems((prev) => prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item)))

    const { error } = await supabase.from('cart_items').update({ quantity }).eq('id', cartItemId)

    if (error) {
      // Revert — refetch to get correct state
      fetchCart()
      return { error: error.message }
    }

    return { error: null }
  }

  async function removeFromCart(cartItemId: string) {
    // Optimistic update — remove immediately from local state
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId))

    const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId)

    if (error) {
      // Revert on error
      fetchCart()
      return { error: error.message }
    }

    return { error: null }
  }

  async function clearCart() {
    if (!profile?.id) return

    await supabase.from('cart_items').delete().eq('student_id', profile.id)
  }

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || 0
    return sum + price * item.quantity
  }, 0)

  return {
    cartItems,
    cartCount,
    cartTotal,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refetch: fetchCart,
  }
}
