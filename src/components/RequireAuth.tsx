import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

import type React from 'react'

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const status = useAuthStore((s) => s.status)
  const token = useAuthStore((s) => s.token)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (status === 'anonymous' || !token) {
      navigate('/login', { replace: true, state: { from: location.pathname } })
    }
  }, [location.pathname, navigate, status, token])

  if (status === 'bootstrapping') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm">Cargando…</div>
      </div>
    )
  }

  if (status === 'anonymous' || !token) return null

  return <>{children}</>
}
