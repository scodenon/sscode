import { MoreVertical, Plus } from 'lucide-react'
import type { Account } from '@/api/types'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/utils/money'

function formatAccountType(type: Account['type']) {
  if (type === 'cash') return 'Efectivo'
  if (type === 'bank') return 'Banco'
  if (type === 'credit') return 'Crédito'
  return 'Otro'
}

function formatCurrencyChip(currency: string) {
  return currency.toUpperCase() === 'PEN' ? 'S/' : currency.toUpperCase()
}

type Props = {
  items: Account[]
  loading: boolean
  selectedId: string | null
  balancesByAccountId?: Record<string, number | undefined>
  onSelect: (id: string) => void
  onNew: () => void
  onEdit: (a: Account) => void
  onDelete: (a: Account) => void
}

export function AccountsPanel({
  items,
  loading,
  selectedId,
  balancesByAccountId,
  onSelect,
  onNew,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 shadow-soft backdrop-blur">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <div className="text-sm font-semibold text-zinc-100">Cuentas</div>
          <div className="text-xs text-zinc-500">Selecciona una para ver transacciones</div>
        </div>
        <Button variant="secondary" onClick={onNew} className="h-9 px-3">
          <Plus className="h-4 w-4" />
          Nueva
        </Button>
      </div>

      <div className="overflow-auto p-2">
        {loading ? (
          <div className="space-y-2 p-2">
            <div className="h-14 animate-pulse rounded-2xl bg-white/5" />
            <div className="h-14 animate-pulse rounded-2xl bg-white/5" />
            <div className="h-14 animate-pulse rounded-2xl bg-white/5" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-4 text-sm text-zinc-400">
            Aún no tienes cuentas.
            <div className="mt-3">
              <Button onClick={onNew}>Crear cuenta</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((a) => {
              const selected = a.id === selectedId
              return (
                <div
                  key={a.id}
                  className={cn(
                    'group flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-3 py-2 transition-[background-color,box-shadow,transform] duration-150 ease-out',
                    selected
                      ? 'border-blue-500/35 bg-gradient-to-b from-blue-500/10 to-purple-500/5 shadow-soft'
                      : 'border-white/10 bg-zinc-950/20 hover:bg-white/5 hover:shadow-soft hover:-translate-y-px',
                  )}
                  onClick={() => onSelect(a.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-zinc-100">{a.name}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">
                      <span className="uppercase">{formatCurrencyChip(a.currency)}</span>
                      <span className="text-zinc-700">•</span>
                      <span>{formatAccountType(a.type)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-[11px] text-zinc-500">Saldo</div>
                      <div className="text-sm font-semibold text-zinc-100">
                        {formatMoney(balancesByAccountId?.[a.id] ?? a.initialBalance, a.currency)}
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        className="rounded-xl p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-100 focus-visible:ring-2 focus-visible:ring-blue-500/40"
                        onClick={(e) => {
                          e.stopPropagation()
                          const next = document.getElementById(`acc_menu_${a.id}`)
                          next?.classList.toggle('hidden')
                        }}
                        aria-label="Acciones"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      <div
                        id={`acc_menu_${a.id}`}
                        className="absolute right-0 top-12 hidden w-44 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 shadow-lift backdrop-blur"
                      >
                        <button
                          type="button"
                          className="block w-full px-3 py-2 text-left text-sm text-zinc-100 hover:bg-white/10"
                          onClick={(e) => {
                            e.stopPropagation()
                            document.getElementById(`acc_menu_${a.id}`)?.classList.add('hidden')
                            onEdit(a)
                          }}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="block w-full px-3 py-2 text-left text-sm text-red-300 hover:bg-white/10"
                          onClick={(e) => {
                            e.stopPropagation()
                            document.getElementById(`acc_menu_${a.id}`)?.classList.add('hidden')
                            onDelete(a)
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
