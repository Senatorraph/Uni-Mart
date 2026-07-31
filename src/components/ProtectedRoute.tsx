import { ReactNode } from 'react'
import { Navigate } from '@tanstack/react-router'
import { useAuth } from '@/context/AuthContext'
import { UserRole } from '@/types'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: UserRole[]
}

// Role home paths aren't statically known route literals, so the router's
// typed `to` prop needs a cast here.
export const roleHome: Record<UserRole, string> = {
  student: '/',
  vendor: '/vendor/dashboard',
  rider: '/rider/dashboard',
  university_admin: '/admin/dashboard',
  super_admin: '/super-admin/dashboard'
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#6C3FC5] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" search={{ next: '' }} />
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#6C3FC5] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to={roleHome[profile.role] as any} />
  }

  return <>{children}</>
}

export function StudentRoute({ children }: { children: ReactNode }) {
  return <ProtectedRoute allowedRoles={['student']}>{children}</ProtectedRoute>
}

export function VendorRoute({ children }: { children: ReactNode }) {
  return <ProtectedRoute allowedRoles={['vendor']}>{children}</ProtectedRoute>
}

export function RiderRoute({ children }: { children: ReactNode }) {
  return <ProtectedRoute allowedRoles={['rider']}>{children}</ProtectedRoute>
}

export function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['university_admin', 'super_admin']}>
      {children}
    </ProtectedRoute>
  )
}
