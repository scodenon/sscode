import { useEffect, useMemo, useState } from 'react'
import type { Account, AccountType } from '@/api/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { formatNumber, parseAmount } from '@/utils/money'

type Draft = {
  name: string
  type: AccountType
  currency: string
  initialBalance: string
}

type Props = {
  open: boolean
  account?: Account | null
  onClose: () => void
  onSave: (input: { name: string; type: AccountType; currency: string; initialBalance: number }) => Promise<void>
}

export function AccountDialog({ open, account, onClose, onSave }: Props) {
  const isEdit = Boolean(account)
  const [draft, setDraft] = useState<Draft>({
    name: '',
    type: 'bank',
    currency: 'PEN',
    initialBalance: '0',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    if (account) {
      setDraft({
        name: account.name,
        type: account.type,
        currency: 'PEN',
        initialBalance: formatNumber(account.initialBalance ?? 0, 2),
      })
    } else {
      setDraft({ name: '', type: 'bank', currency: 'PEN', initialBalance: '0' })
    }
  }, [account, open])

  const canSubmit = useMemo(() => {
    if (!draft.name.trim()) return false
    const n = parseAmount(draft.initialBalance)
    if (!Number.isFinite(n)) return false
    if (!draft.currency.trim()) return false
    return true
  }, [draft.currency, draft.initialBalance, draft.name])

  async function submit() {
    setSubmitting(true)
    setError(null)
    try {
      const initialBalance = parseAmount(draft.initialBalance)
      await onSave({
        name: draft.name.trim(),
        type: draft.type,
        currency: 'PEN',
        initialBalance,
      })
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      title={isEdit ? 'Editar cuenta' : 'Nueva cuenta'}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={!canSubmit || submitting}>
            Guardar
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Input
          label="Nombre"
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          placeholder="Cuenta principal"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-100">Tipo</label>
            <select
              className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              value={draft.type}
              onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value as AccountType }))}
            >
              <option value="cash">Efectivo</option>
              <option value="bank">Banco</option>
              <option value="credit">Crédito</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-100">Moneda</label>
            <div className="flex h-10 items-center rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100">
              PEN (S/)
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-zinc-100" htmlFor="initialBalance">
            Saldo inicial
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
              S/
            </div>
            <input
              id="initialBalance"
              inputMode="decimal"
              value={draft.initialBalance}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9.,-]/g, '')
                setDraft((d) => ({ ...d, initialBalance: v }))
              }}
              onBlur={() => {
                const n = parseAmount(draft.initialBalance)
                if (Number.isFinite(n)) setDraft((d) => ({ ...d, initialBalance: formatNumber(n, 2) }))
              }}
              placeholder="0.00"
              className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 pl-10 pr-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        </div>

        {error ? (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
            {error}
          </div>
        ) : null}
      </div>
    </Modal>
  )
}
