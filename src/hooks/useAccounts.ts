import { useCallback, useEffect, useState } from 'react'
import type { Account } from '@/api/types'
import { ApiClientError } from '@/api/types'
import { apiCreateAccount, apiDeleteAccount, apiListAccounts, apiUpdateAccount } from '@/api/endpoints'

export function useAccounts() {
  const [items, setItems] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiListAccounts()
      setItems(res.items)
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Error al cargar cuentas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const create = useCallback(
    async (input: { name: string; type: Account['type']; currency: string; initialBalance: number }) => {
      const res = await apiCreateAccount(input)
      setItems((prev) => [res.account, ...prev])
      return res.account
    },
    [],
  )

  const update = useCallback(
    async (id: string, input: Partial<Pick<Account, 'name' | 'type' | 'currency' | 'initialBalance'>>) => {
      const res = await apiUpdateAccount(id, input)
      setItems((prev) => prev.map((a) => (a.id === id ? res.account : a)))
      return res.account
    },
    [],
  )

  const remove = useCallback(async (id: string) => {
    await apiDeleteAccount(id)
    setItems((prev) => prev.filter((a) => a.id !== id))
  }, [])

  return { items, loading, error, refresh, create, update, remove }
}

