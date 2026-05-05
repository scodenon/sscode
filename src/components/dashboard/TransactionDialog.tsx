import { useEffect, useMemo, useState } from 'react'
import type { Account, Transaction, TransactionType } from '@/api/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { datetimeLocalToIso, isoToDatetimeLocal } from '@/utils/datetime'
import { formatNumber, parseAmount } from '@/utils/money'

type Draft = {
  accountId: string
  type: TransactionType
  amount: string
  currency: string
  category: string
  description: string
  occurredAtLocal: string
}

type Props = {
  open: boolean
  transaction?: Transaction | null
  accounts: Account[]
  defaultAccountId?: string
  defaultType?: TransactionType
  onClose: () => void
  onSave: (input: {
    accountId: string
    type: TransactionType
    amount: number
    currency: string
    category?: string
    description?: string
    occurredAt: string
  }) => Promise<void>
}

export function TransactionDialog({
  open,
  transaction,
  accounts,
  defaultAccountId,
  defaultType,
  onClose,
  onSave,
}: Props) {
  const isEdit = Boolean(transaction)
  const [draft, setDraft] = useState<Draft>({
    accountId: defaultAccountId ?? '',
    type: defaultType ?? 'expense',
    amount: '0',
    currency: 'PEN',
    category: '',
    description: '',
    occurredAtLocal: isoToDatetimeLocal(new Date().toISOString()),
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    if (transaction) {
      setDraft({
        accountId: transaction.accountId,
        type: transaction.type,
        amount: formatNumber(transaction.amount ?? 0, 2),
        currency: 'PEN',
        category: transaction.category ?? '',
        description: transaction.description ?? '',
        occurredAtLocal: isoToDatetimeLocal(transaction.occurredAt),
      })
      return
    }
    const acc = accounts.find((a) => a.id === (defaultAccountId ?? '')) ?? accounts[0]
    setDraft({
      accountId: acc?.id ?? '',
      type: defaultType ?? 'expense',
      amount: '0',
      currency: 'PEN',
      category: '',
      description: '',
      occurredAtLocal: isoToDatetimeLocal(new Date().toISOString()),
    })
  }, [accounts, defaultAccountId, defaultType, open, transaction])

  const canSubmit = useMemo(() => {
    if (!draft.accountId) return false
    const n = parseAmount(draft.amount)
    if (!Number.isFinite(n) || n <= 0) return false
    if (!draft.currency.trim()) return false
    const iso = datetimeLocalToIso(draft.occurredAtLocal)
    if (!iso) return false
    if (!draft.description.trim()) return false
    return true
  }, [draft.accountId, draft.amount, draft.currency, draft.description, draft.occurredAtLocal])

  async function submit() {
    setSubmitting(true)
    setError(null)
    try {
      const occurredAt = datetimeLocalToIso(draft.occurredAtLocal)
      const amount = parseAmount(draft.amount)
      await onSave({
        accountId: draft.accountId,
        type: draft.type,
        amount,
        currency: 'PEN',
        category: draft.category.trim() ? draft.category.trim() : undefined,
        description: draft.description.trim(),
        occurredAt,
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
      title={
        isEdit
          ? 'Editar movimiento'
          : (defaultType ?? draft.type) === 'income'
            ? 'Nuevo ingreso'
            : 'Nuevo gasto'
      }
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-100">Cuenta</label>
            <select
              className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              value={draft.accountId}
              onChange={(e) => {
                const accountId = e.target.value
                setDraft((d) => ({
                  ...d,
                  accountId,
                }))
              }}
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-100">Tipo</label>
            <select
              className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              value={draft.type}
              onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value as TransactionType }))}
            >
              <option value="expense">Gasto</option>
              <option value="income">Ingreso</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-100" htmlFor="amount">
              Monto
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                S/
              </div>
              <input
                id="amount"
                inputMode="decimal"
                value={draft.amount}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9.,-]/g, '')
                  setDraft((d) => ({ ...d, amount: v }))
                }}
                onBlur={() => {
                  const n = parseAmount(draft.amount)
                  if (Number.isFinite(n)) setDraft((d) => ({ ...d, amount: formatNumber(n, 2) }))
                }}
                placeholder="0.00"
                className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 pl-10 pr-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-100">Moneda</label>
            <div className="flex h-10 items-center rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100">
              PEN (S/)
            </div>
          </div>
        </div>

        <Input
          label="Fecha"
          type="datetime-local"
          value={draft.occurredAtLocal}
          onChange={(e) => setDraft((d) => ({ ...d, occurredAtLocal: e.target.value }))}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-zinc-100" htmlFor="category">
            Categoría (opcional)
          </label>
          <input
            id="category"
            list="categorias-peru"
            value={draft.category}
            onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
            placeholder="Alimentación"
            className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          />
          <datalist id="categorias-peru">
            <option value="Alimentación" />
            <option value="Transporte" />
            <option value="Vivienda" />
            <option value="Servicios" />
            <option value="Salud" />
            <option value="Educación" />
            <option value="Entretenimiento" />
            <option value="Compras" />
            <option value="Otros" />
          </datalist>
        </div>

        <Input
          label="Descripción"
          value={draft.description}
          onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          placeholder="Supermercado"
        />

        {error ? (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
            {error}
          </div>
        ) : null}
      </div>
    </Modal>
  )
}
