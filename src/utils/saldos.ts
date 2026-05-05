import type { Account, Transaction } from '@/api/types'

export function calcularSaldosActuales(input: {
  cuentas: Account[]
  transacciones: Transaction[]
}): Record<string, number> {
  const map: Record<string, number> = {}
  for (const c of input.cuentas) map[c.id] = Number(c.initialBalance) || 0

  for (const t of input.transacciones) {
    const n = Number(t.amount)
    if (!Number.isFinite(n)) continue
    if (map[t.accountId] === undefined) continue
    if (t.type === 'income') map[t.accountId] += n
    if (t.type === 'expense') map[t.accountId] -= n
  }

  return map
}
