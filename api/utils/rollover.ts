import { prisma } from '../db/prisma.js'

function monthStart(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0)
}

export async function aplicarRolloverMensual(userId: string) {
  const ahora = new Date()
  const inicioMesActual = monthStart(ahora)

  const cuentas = await prisma.account.findMany({
    where: { userId },
    select: { id: true, initialBalance: true, balanceStartAt: true },
  })

  const porActualizar = cuentas.filter((c) => c.balanceStartAt.getTime() < inicioMesActual.getTime())
  if (porActualizar.length === 0) return

  for (const cuenta of porActualizar) {
    const groups = await prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        accountId: cuenta.id,
        occurredAt: {
          gte: cuenta.balanceStartAt,
          lt: inicioMesActual,
        },
      },
      _sum: { amount: true },
    })

    const ingresos = groups.find((g) => g.type === 'income')?._sum.amount ?? 0
    const gastos = groups.find((g) => g.type === 'expense')?._sum.amount ?? 0

    const nuevoSaldoInicial = cuenta.initialBalance + ingresos - gastos

    await prisma.account.update({
      where: { id: cuenta.id },
      data: {
        initialBalance: nuevoSaldoInicial,
        balanceStartAt: inicioMesActual,
      },
    })
  }
}
