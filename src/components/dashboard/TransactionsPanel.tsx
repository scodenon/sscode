import { Pencil, Plus, Trash2 } from 'lucide-react'
import type { Account, Transaction } from '@/api/types'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { formatDateShort } from '@/utils/datetime'
import { formatMoney } from '@/utils/money'

type Props = {
  account: Account | null
  items: Transaction[]
  loading: boolean
  filter: 'all' | 'income' | 'expense'
  onFilterChange: (v: Props['filter']) => void
  onNew: (type: 'income' | 'expense') => void
  onEdit: (t: Transaction) => void
  onDelete: (t: Transaction) => void
}

export function TransactionsPanel({
  account,
  items,
  loading,
  filter,
  onFilterChange,
  onNew,
  onEdit,
  onDelete,
}: Props) {
  const visible = items.filter((t) => (filter === 'all' ? true : t.type === filter))

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 shadow-soft backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div>
          <div className="text-sm font-semibold text-zinc-100">Movimientos</div>
          <div className="text-xs text-zinc-500">
            {account ? `Cuenta: ${account.name}` : 'Selecciona una cuenta'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden rounded-xl border border-white/10 bg-zinc-950/30 p-1 shadow-soft sm:flex">
            {(['all', 'income', 'expense'] as const).map((k) => (
              <button
                key={k}
                type="button"
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  filter === k
                    ? 'bg-white/10 text-zinc-100'
                    : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100',
                )}
                onClick={() => onFilterChange(k)}
              >
                {k === 'all' ? 'Todas' : k === 'income' ? 'Ingresos' : 'Gastos'}
              </button>
            ))}
          </div>
          <Button
            variant="secondary"
            onClick={() => onNew('income')}
            disabled={!account}
            className="h-10 px-3"
          >
            <Plus className="h-4 w-4" />
            Ingreso
          </Button>
          <Button onClick={() => onNew('expense')} disabled={!account} className="h-10 px-3">
            <Plus className="h-4 w-4" />
            Gasto
          </Button>
        </div>
      </div>

      <div className="overflow-auto">
        {!account ? (
          <div className="p-6 text-sm text-zinc-400">Selecciona una cuenta para ver movimientos.</div>
        ) : loading ? (
          <div className="space-y-2 p-4">
            <div className="h-12 animate-pulse rounded-2xl bg-white/5" />
            <div className="h-12 animate-pulse rounded-2xl bg-white/5" />
            <div className="h-12 animate-pulse rounded-2xl bg-white/5" />
          </div>
        ) : visible.length === 0 ? (
          <div className="p-6 text-sm text-zinc-400">No hay movimientos en esta cuenta.</div>
        ) : (
          <div className="divide-y divide-white/10">
            {visible.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-white/5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'rounded-lg px-2 py-0.5 text-xs font-medium',
                        t.type === 'income'
                          ? 'bg-emerald-500/10 text-emerald-200'
                          : 'bg-red-500/10 text-red-200',
                      )}
                    >
                      {t.type === 'income' ? 'Ingreso' : 'Gasto'}
                    </span>
                    <span className="truncate text-sm font-medium text-zinc-100">
                      {t.description?.trim() ? t.description : 'Sin descripción'}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {formatDateShort(t.occurredAt)}
                    {t.category?.trim() ? ` · ${t.category}` : ''}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'text-sm font-semibold',
                      t.type === 'income' ? 'text-emerald-200' : 'text-red-200',
                    )}
                  >
                    {formatMoney(t.amount, t.currency)}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="rounded-xl p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-100 focus-visible:ring-2 focus-visible:ring-blue-500/40"
                      onClick={() => onEdit(t)}
                      aria-label="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="rounded-xl p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-red-200 focus-visible:ring-2 focus-visible:ring-red-500/30"
                      onClick={() => onDelete(t)}
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
