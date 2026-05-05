import { useMemo, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { useAccounts } from '@/hooks/useAccounts'
import { useTransaccionesGlobales } from '@/hooks/useTransaccionesGlobales'
import { formatMoney } from '@/utils/money'
import { BarrasHorizontales } from '@/components/charts/BarrasHorizontales'
import {
  filtrarPorRango,
  resumen,
  saldoPorCuenta,
  totalesPorCategoria,
} from '@/utils/reportes'

function inicioMesActual() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function finHoy() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function haceNDias(n: number) {
  const d = finHoy()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - n)
}

function isoDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function Reportes() {
  const cuentas = useAccounts()
  const transacciones = useTransaccionesGlobales()

  const [cuentaId, setCuentaId] = useState<string>('todas')
  const [desde, setDesde] = useState<string>(isoDate(inicioMesActual()))
  const [hasta, setHasta] = useState<string>(isoDate(finHoy()))

  const { itemsFiltrados, moneda } = useMemo(() => {
    const base = transacciones.items
    const porCuenta =
      cuentaId === 'todas' ? base : base.filter((t) => t.accountId === cuentaId)

    const d = new Date(`${desde}T00:00:00`)
    const h = new Date(`${hasta}T00:00:00`)
    const rango = Number.isNaN(d.getTime()) || Number.isNaN(h.getTime()) ? porCuenta : filtrarPorRango(porCuenta, d, h)

    const c = cuentaId === 'todas' ? null : cuentas.items.find((x) => x.id === cuentaId) ?? null
    return { itemsFiltrados: rango, moneda: c?.currency ?? 'PEN' }
  }, [cuentaId, cuentas.items, desde, hasta, transacciones.items])

  const resumenRango = useMemo(() => resumen(itemsFiltrados), [itemsFiltrados])

  const categorias = useMemo(() => {
    const t = totalesPorCategoria(itemsFiltrados)
    return t
      .filter((x) => x.totalGastos > 0)
      .map((x) => ({ etiqueta: x.categoria, valor: x.totalGastos }))
  }, [itemsFiltrados])


  const cuentasConSaldo = useMemo(() => {
    const base = cuentaId === 'todas' ? transacciones.items : transacciones.items.filter((t) => t.accountId === cuentaId)
    return saldoPorCuenta({ cuentas: cuentas.items, transacciones: base })
  }, [cuentaId, cuentas.items, transacciones.items])

  return (
    <AppShell title="Reportes" subtitle="Totales y categorías">
      <div className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 shadow-soft">
                <CalendarDays className="h-4 w-4" />
              </span>
              Rango y cuenta
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <button
                type="button"
                className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-zinc-100 shadow-soft transition-colors hover:bg-white/10"
                onClick={() => {
                  setDesde(isoDate(inicioMesActual()))
                  setHasta(isoDate(finHoy()))
                }}
              >
                Mes actual
              </button>
              <button
                type="button"
                className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-zinc-100 shadow-soft transition-colors hover:bg-white/10"
                onClick={() => {
                  setDesde(isoDate(haceNDias(6)))
                  setHasta(isoDate(finHoy()))
                }}
              >
                7 días
              </button>
              <button
                type="button"
                className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-zinc-100 shadow-soft transition-colors hover:bg-white/10"
                onClick={() => {
                  setDesde(isoDate(haceNDias(29)))
                  setHasta(isoDate(finHoy()))
                }}
              >
                30 días
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm shadow-soft">
              <input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                className="bg-transparent text-sm text-zinc-100 outline-none"
              />
              <span className="text-zinc-500">a</span>
              <input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                className="bg-transparent text-sm text-zinc-100 outline-none"
              />
            </div>

            <select
              className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-zinc-100 shadow-soft outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              value={cuentaId}
              onChange={(e) => setCuentaId(e.target.value)}
            >
              <option value="todas">Todas las cuentas</option>
              {cuentas.items.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {transacciones.error ? (
          <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-100 shadow-soft">
            {transacciones.error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-soft">
            <div className="text-xs text-zinc-400">Ingresos</div>
            <div className="mt-2 text-2xl font-semibold text-green-200">{formatMoney(resumenRango.totalIngresos, moneda)}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-soft">
            <div className="text-xs text-zinc-400">Gastos</div>
            <div className="mt-2 text-2xl font-semibold text-red-200">{formatMoney(resumenRango.totalGastos, moneda)}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-soft">
            <div className="text-xs text-zinc-400">Neto</div>
            <div className="mt-2 text-2xl font-semibold text-zinc-100">{formatMoney(resumenRango.neto, moneda)}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-soft">
            <div className="mb-3 text-sm font-semibold">Gasto por categoría</div>
            {categorias.length === 0 ? (
              <div className="text-sm text-zinc-400">Aún no hay gastos en el rango seleccionado.</div>
            ) : (
              <BarrasHorizontales items={categorias} maxItems={10} colorClassName="bg-red-500" />
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-soft">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Saldo por cuenta</div>
              <div className="text-xs text-zinc-500">Saldo inicial + ingresos - gastos</div>
            </div>
            <div className="text-xs text-zinc-400">Moneda: {moneda === 'PEN' ? 'PEN (S/)' : moneda}</div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {cuentasConSaldo.map((r) => (
              <div key={r.cuenta.id} className="rounded-2xl border border-white/10 bg-zinc-950/30 p-4 shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">{r.cuenta.name}</div>
                    <div className="mt-1 text-xs text-zinc-500">
                      Ingresos: {formatMoney(r.ingresos, r.cuenta.currency)} · Gastos: {formatMoney(r.gastos, r.cuenta.currency)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-zinc-400">Saldo</div>
                    <div className="text-base font-semibold">{formatMoney(r.saldo, r.cuenta.currency)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
