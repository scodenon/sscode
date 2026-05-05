import { useMemo, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { useAccounts } from '@/hooks/useAccounts'
import { useTransaccionesGlobales } from '@/hooks/useTransaccionesGlobales'
import { BarrasHorizontales } from '@/components/charts/BarrasHorizontales'
import { computeAccountKpis } from '@/utils/kpis'
import { formatMoney } from '@/utils/money'
import { totalesPorCategoria } from '@/utils/reportes'

export default function ResumenMensual() {
  const cuentas = useAccounts()
  const transacciones = useTransaccionesGlobales()
  const [cuentaId, setCuentaId] = useState<string>('todas')

  const inicioMes = useMemo(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0)
  }, [])

  const transaccionesMes = useMemo(() => {
    return transacciones.items.filter((t) => {
      const ts = new Date(t.occurredAt).getTime()
      return Number.isFinite(ts) && ts >= inicioMes.getTime()
    })
  }, [inicioMes, transacciones.items])

  const transaccionesMesCuenta = useMemo(() => {
    if (cuentaId === 'todas') return transaccionesMes
    return transaccionesMes.filter((t) => t.accountId === cuentaId)
  }, [cuentaId, transaccionesMes])

  const cuenta = useMemo(() => {
    if (cuentaId === 'todas') return null
    return cuentas.items.find((c) => c.id === cuentaId) ?? null
  }, [cuentaId, cuentas.items])

  const kpisSeleccion = useMemo(() => {
    if (cuentaId === 'todas') {
      const saldoInicialTotal = cuentas.items.reduce((acc, a) => acc + (Number(a.initialBalance) || 0), 0)
      return computeAccountKpis({ initialBalance: saldoInicialTotal, transactions: transaccionesMesCuenta })
    }
    if (!cuenta) return null
    return computeAccountKpis({ initialBalance: cuenta.initialBalance, transactions: transaccionesMesCuenta })
  }, [cuenta, cuentaId, cuentas.items, transaccionesMesCuenta])

  const kpisTotales = useMemo(() => {
    const saldoInicialTotal = cuentas.items.reduce((acc, a) => acc + (Number(a.initialBalance) || 0), 0)
    return computeAccountKpis({ initialBalance: saldoInicialTotal, transactions: transaccionesMes })
  }, [cuentas.items, transaccionesMes])

  const categoriasSeleccion = useMemo(() => {
    return totalesPorCategoria(transaccionesMesCuenta)
      .filter((x) => x.totalGastos > 0)
      .map((x) => ({ etiqueta: x.categoria, valor: x.totalGastos }))
  }, [transaccionesMesCuenta])

  const categoriasTotales = useMemo(() => {
    return totalesPorCategoria(transaccionesMes)
      .filter((x) => x.totalGastos > 0)
      .map((x) => ({ etiqueta: x.categoria, valor: x.totalGastos }))
  }, [transaccionesMes])

  return (
    <AppShell title="Resumen del mes" subtitle="Desde el día 1 del mes hasta hoy">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-zinc-400">Selecciona cuenta para ver su resumen</div>
          <select
            className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-zinc-100 shadow-soft outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            value={cuentaId}
            onChange={(e) => setCuentaId(e.target.value)}
          >
            <option value="todas">Cuenta seleccionada: Todas</option>
            {cuentas.items.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-soft">
            <div className="text-sm font-semibold">Cuenta seleccionada</div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-zinc-950/30 p-4 shadow-soft">
                <div className="text-xs text-zinc-400">Gastado</div>
                <div className="mt-1 text-xl font-semibold text-red-200">
                  {kpisSeleccion ? formatMoney(kpisSeleccion.totalGastos, cuenta?.currency ?? 'PEN') : '—'}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-zinc-950/30 p-4 shadow-soft">
                <div className="text-xs text-zinc-400">Ingresado</div>
                <div className="mt-1 text-xl font-semibold text-green-200">
                  {kpisSeleccion ? formatMoney(kpisSeleccion.totalIngresos, cuenta?.currency ?? 'PEN') : '—'}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-zinc-950/30 p-4 shadow-soft">
                <div className="text-xs text-zinc-400">Saldo</div>
                <div className="mt-1 text-xl font-semibold text-zinc-100">
                  {kpisSeleccion ? formatMoney(kpisSeleccion.saldoActual, cuenta?.currency ?? 'PEN') : '—'}
                </div>
                <div className="mt-1 text-xs text-zinc-500">
                  {cuenta ? `Saldo inicial: ${formatMoney(cuenta.initialBalance, cuenta.currency)}` : 'Total en todas las cuentas'}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-3 text-sm font-semibold">Gasto por categoría</div>
              {categoriasSeleccion.length === 0 ? (
                <div className="text-sm text-zinc-400">Aún no hay gastos este mes.</div>
              ) : (
                <BarrasHorizontales items={categoriasSeleccion} maxItems={8} colorClassName="bg-red-500" />
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-soft">
            <div className="text-sm font-semibold">Total (todas las cuentas)</div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-zinc-950/30 p-4 shadow-soft">
                <div className="text-xs text-zinc-400">Gastado</div>
                <div className="mt-1 text-xl font-semibold text-red-200">{formatMoney(kpisTotales.totalGastos, 'PEN')}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-zinc-950/30 p-4 shadow-soft">
                <div className="text-xs text-zinc-400">Ingresado</div>
                <div className="mt-1 text-xl font-semibold text-green-200">{formatMoney(kpisTotales.totalIngresos, 'PEN')}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-zinc-950/30 p-4 shadow-soft">
                <div className="text-xs text-zinc-400">Saldo</div>
                <div className="mt-1 text-xl font-semibold text-zinc-100">{formatMoney(kpisTotales.saldoActual, 'PEN')}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4">
              <div>
                <div className="mb-3 text-sm font-semibold">Gasto por categoría</div>
                {categoriasTotales.length === 0 ? (
                  <div className="text-sm text-zinc-400">Aún no hay gastos este mes.</div>
                ) : (
                  <BarrasHorizontales items={categoriasTotales} maxItems={8} colorClassName="bg-red-500" />
                )}
              </div>

            </div>
          </div>
        </div>

        {transacciones.error ? (
          <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-100 shadow-soft">
            {transacciones.error}
          </div>
        ) : null}
      </div>
    </AppShell>
  )
}
