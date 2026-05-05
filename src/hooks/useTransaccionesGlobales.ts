import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Transaction } from '@/api/types'
import { ApiClientError } from '@/api/types'
import { apiListTransactions } from '@/api/endpoints'

export function useTransaccionesGlobales() {
  const [items, setItems] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sortDesc = useCallback((list: Transaction[]) => {
    return [...list].sort((a, b) => {
      const ta = new Date(a.occurredAt).getTime()
      const tb = new Date(b.occurredAt).getTime()
      return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0)
    })
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiListTransactions(undefined)
      setItems(sortDesc(res.items))
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Error al cargar transacciones')
    } finally {
      setLoading(false)
    }
  }, [sortDesc])

  const enabled = useMemo(() => true, [])

  useEffect(() => {
    if (enabled) void refresh()
  }, [enabled, refresh])

  return { items, loading, error, refresh }
}
