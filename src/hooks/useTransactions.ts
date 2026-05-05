import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Transaction } from '@/api/types'
import { ApiClientError } from '@/api/types'
import {
  apiCreateTransaction,
  apiDeleteTransaction,
  apiListTransactions,
  apiUpdateTransaction,
} from '@/api/endpoints'

export function useTransactions(accountId: string | null) {
  const [items, setItems] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const enabled = useMemo(() => Boolean(accountId), [accountId])

  const sortDesc = useCallback((list: Transaction[]) => {
    return [...list].sort((a, b) => {
      const ta = new Date(a.occurredAt).getTime()
      const tb = new Date(b.occurredAt).getTime()
      return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0)
    })
  }, [])

  const refresh = useCallback(async () => {
    if (!accountId) {
      setItems([])
      setLoading(false)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await apiListTransactions(accountId)
      setItems(sortDesc(res.items))
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Error al cargar transacciones')
    } finally {
      setLoading(false)
    }
  }, [accountId, sortDesc])

  useEffect(() => {
    if (enabled) void refresh()
  }, [enabled, refresh])

  const create = useCallback(
    async (input: {
      accountId: string
      type: Transaction['type']
      amount: number
      currency: string
      category?: string
      description?: string
      occurredAt: string
    }) => {
      const res = await apiCreateTransaction(input)
      setItems((prev) => sortDesc([res.transaction, ...prev]))
      return res.transaction
    },
    [sortDesc],
  )

  const update = useCallback(
    async (
      id: string,
      input: Partial<Pick<Transaction, 'type' | 'amount' | 'currency' | 'category' | 'description' | 'occurredAt'>>,
    ) => {
      const res = await apiUpdateTransaction(id, input)
      setItems((prev) => sortDesc(prev.map((t) => (t.id === id ? res.transaction : t))))
      return res.transaction
    },
    [sortDesc],
  )

  const remove = useCallback(async (id: string) => {
    await apiDeleteTransaction(id)
    setItems((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { items, loading, error, refresh, create, update, remove }
}
