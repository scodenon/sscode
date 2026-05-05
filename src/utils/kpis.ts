import type { Transaction } from '@/api/types'

export type AccountKpis = {
  totalIngresos: number
  totalGastos: number
  saldoActual: number
}

export function computeAccountKpis(input: {
  initialBalance: number
  transactions: Transaction[]
}): AccountKpis {
  let totalIngresos = 0
  let totalGastos = 0

  for (const t of input.transactions) {
    const amount = Number(t.amount)
    if (!Number.isFinite(amount)) continue
    if (t.type === 'income') totalIngresos += amount
    if (t.type === 'expense') totalGastos += amount
  }

  const saldoActual = input.initialBalance + totalIngresos - totalGastos

  return {
    totalIngresos,
    totalGastos,
    saldoActual,
  }
}

