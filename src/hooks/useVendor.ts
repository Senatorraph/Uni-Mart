import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { Vendor } from '@/types'

export function useVendor() {
  const { profile } = useAuth()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.id) return
    fetchVendor()
  }, [profile?.id])

  async function fetchVendor() {
    if (!profile?.id) return

    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('user_id', profile.id)
      .single()

    if (error) {
      console.error('Error fetching vendor:', error.message)
    } else {
      setVendor(data as Vendor)
    }
    setLoading(false)
  }

  async function toggleStoreOpen(isOpen: boolean) {
    if (!vendor?.id) return

    const { error } = await supabase
      .from('vendors')
      .update({ is_open: isOpen })
      .eq('id', vendor.id)

    if (!error) {
      setVendor((prev) => (prev ? { ...prev, is_open: isOpen } : null))
    }
  }

  return { vendor, loading, toggleStoreOpen, refetch: fetchVendor }
}
