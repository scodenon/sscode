import type { Account, Transaction } from '@/api/types'

export type ResumenRango = {
  totalIngresos: number
  totalGastos: number
  neto: number
}

export type TotalesPorCategoria = {
  categoria: string
  totalGastos: number
  totalIngresos: number
}

export type PuntoSerie = {
  etiqueta: string
  ingresos: number
  gastos: number
  neto: number
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function isoDia(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function filtrarPorRango(items: Transaction[], desde: Date, hasta: Date) {
  const a = startOfDay(desde).getTime()
  const b = startOfDay(hasta).getTime()
  const max = Math.max(a, b)
  const min = Math.min(a, b)

  return items.filter((t) => {
    const ts = new Date(t.occurredAt).getTime()
    if (!Number.isFinite(ts)) return false
    const day = startOfDay(new Date(ts)).getTime()
    return day >= min && day <= max
  })
}

export function resumen(items: Transaction[]): ResumenRango {
  let totalIngresos = 0
  let totalGastos = 0
  for (const t of items) {
    const n = Number(t.amount)
    if (!Number.isFinite(n)) continue
    if (t.type === 'income') totalIngresos += n
    if (t.type === 'expense') totalGastos += n
  }
  return {
    totalIngresos,
    totalGastos,
    neto: totalIngresos - totalGastos,
  }
}

export function totalesPorCategoria(items: Transaction[]): TotalesPorCategoria[] {
  const map = new Map<string, TotalesPorCategoria>()
  for (const t of items) {
    const n = Number(t.amount)
    if (!Number.isFinite(n)) continue
    const categoria = (t.category ?? '').trim() || 'Sin categoría'
    const current = map.get(categoria) ?? {
      categoria,
      totalGastos: 0,
      totalIngresos: 0,
    }
    if (t.type === 'expense') current.totalGastos += n
    if (t.type === 'income') current.totalIngresos += n
    map.set(categoria, current)
  }

  return [...map.values()].sort((a, b) => b.totalGastos - a.totalGastos)
}

export function serieDiaria(items: Transaction[], desde: Date, hasta: Date): PuntoSerie[] {
  const min = startOfDay(desde)
  const max = startOfDay(hasta)
  const start = min.getTime() <= max.getTime() ? min : max
  const end = min.getTime() <= max.getTime() ? max : min

  const days: PuntoSerie[] = []
  const index = new Map<string, PuntoSerie>()

  for (let d = new Date(start); d.getTime() <= end.getTime(); d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
    const key = isoDia(d)
    const punto: PuntoSerie = { etiqueta: key, ingresos: 0, gastos: 0, neto: 0 }
    days.push(punto)
    index.set(key, punto)
  }

  for (const t of items) {
    const ts = new Date(t.occurredAt)
    if (Number.isNaN(ts.getTime())) continue
    const key = isoDia(ts)
    const punto = index.get(key)
    if (!punto) continue
    const n = Number(t.amount)
    if (!Number.isFinite(n)) continue
    if (t.type === 'income') punto.ingresos += n
    if (t.type === 'expense') punto.gastos += n
  }

  for (const p of days) p.neto = p.ingresos - p.gastos
  return days
}

export function saldoPorCuenta(input: {
  cuentas: Account[]
  transacciones: Transaction[]
}) {
  const byId = new Map<string, { cuenta: Account; ingresos: number; gastos: number; saldo: number }>()

  for (const c of input.cuentas) {
    byId.set(c.id, { cuenta: c, ingresos: 0, gastos: 0, saldo: c.initialBalance })
  }

  for (const t of input.transacciones) {
    const row = byId.get(t.accountId)
    if (!row) continue
    const n = Number(t.amount)
    if (!Number.isFinite(n)) continue
    if (t.type === 'income') {
      row.ingresos += n
      row.saldo += n
    }
    if (t.type === 'expense') {
      row.gastos += n
      row.saldo -= n
    }
  }

  return [...byId.values()].sort((a, b) => b.saldo - a.saldo)
}
