import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { Delivery } from '@/types'

export type RiderOrder = {
  id: string
  total_amount: number
  delivery_address: string
  delivery_note: string | null
  status: string
  vendor: { business_name: string; address: string | null } | null
  student: { full_name: string; phone: string | null } | null
}

export type RiderDelivery = Delivery & { order: RiderOrder | null }

const ORDER_EMBED = `
  id, total_amount, delivery_address, delivery_note, status,
  vendor:vendors(business_name, address),
  student:profiles(full_name, phone)
`

export function useRider() {
  const { profile } = useAuth()
  const [availableJobs, setAvailableJobs] = useState<RiderDelivery[]>([])
  const [activeDelivery, setActiveDelivery] = useState<RiderDelivery | null>(null)
  const [completedDeliveries, setCompletedDeliveries] = useState<RiderDelivery[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.id || !profile?.university_id) return
    fetchAll()

    const sub = supabase
      .channel(`rider-${profile.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deliveries' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchAll())
      .subscribe()

    return () => {
      supabase.removeChannel(sub)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id])

  async function fetchAll() {
    if (!profile?.id || !profile?.university_id) return

    const riderId = profile.id
    const universityId = profile.university_id

    const [availableRes, activeRes, completedRes] = await Promise.all([
      // Available jobs — confirmed orders with no rider assigned yet.
      supabase
        .from('deliveries')
        .select(`*, order:orders!inner(${ORDER_EMBED})`)
        .eq('status', 'pending')
        .eq('university_id', universityId)
        .eq('order.status', 'confirmed')
        .is('rider_id', null),

      // Active delivery — assigned to this rider.
      supabase
        .from('deliveries')
        .select(`*, order:orders(${ORDER_EMBED})`)
        .eq('rider_id', riderId)
        .in('status', ['assigned', 'at_vendor', 'picked_up'])
        .maybeSingle(),

      // Completed deliveries.
      supabase
        .from('deliveries')
        .select(`*, order:orders(${ORDER_EMBED})`)
        .eq('rider_id', riderId)
        .eq('status', 'delivered')
        .order('delivered_at', { ascending: false })
        .limit(10),
    ])

    if (availableRes.data) setAvailableJobs(availableRes.data as unknown as RiderDelivery[])

    if (activeRes.data) setActiveDelivery(activeRes.data as unknown as RiderDelivery)
    else setActiveDelivery(null)

    if (completedRes.data) setCompletedDeliveries(completedRes.data as unknown as RiderDelivery[])

    setLoading(false)
  }

  async function acceptJob(deliveryId: string) {
    if (!profile?.id) return { error: 'Not logged in' }

    const { error } = await supabase
      .from('deliveries')
      .update({
        rider_id: profile.id,
        status: 'assigned',
        assigned_at: new Date().toISOString(),
      })
      .eq('id', deliveryId)
      .is('rider_id', null) // prevent race condition

    if (error) return { error: error.message }

    // Update order status
    const delivery = availableJobs.find((j) => j.id === deliveryId)
    if (delivery?.order?.id) {
      await supabase.from('orders').update({ status: 'rider_assigned' }).eq('id', delivery.order.id)
    }

    await fetchAll()
    return { error: null }
  }

  async function updateDeliveryStatus(
    deliveryId: string,
    status: 'at_vendor' | 'picked_up' | 'delivered',
    extraData?: { pickup_photo_url?: string },
  ) {
    const updateData: Partial<Delivery> = {
      status,
      ...(status === 'picked_up' && {
        picked_up_at: new Date().toISOString(),
        pickup_photo_url: extraData?.pickup_photo_url,
      }),
      ...(status === 'delivered' && {
        delivered_at: new Date().toISOString(),
      }),
    }

    const { error } = await supabase.from('deliveries').update(updateData).eq('id', deliveryId)

    if (error) return { error: error.message }

    // Sync order status
    const orderStatusMap: Record<'at_vendor' | 'picked_up' | 'delivered', 'confirmed' | 'picked_up' | 'delivered'> = {
      at_vendor: 'confirmed',
      picked_up: 'picked_up',
      delivered: 'delivered',
    }

    if (activeDelivery?.order?.id) {
      await supabase
        .from('orders')
        .update({
          status: orderStatusMap[status],
          ...(status === 'delivered' && { delivered_at: new Date().toISOString() }),
        })
        .eq('id', activeDelivery.order.id)
    }

    await fetchAll()
    return { error: null }
  }

  return {
    availableJobs,
    activeDelivery,
    completedDeliveries,
    loading,
    acceptJob,
    updateDeliveryStatus,
    refetch: fetchAll,
  }
}
