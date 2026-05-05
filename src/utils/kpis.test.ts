import { describe, expect, it } from 'vitest'
import { computeAccountKpis } from '@/utils/kpis'

describe('computeAccountKpis', () => {
  it('computes totals and current balance', () => {
    const kpis = computeAccountKpis({
      initialBalance: 100,
      transactions: [
        {
          id: 't1',
          userId: 'u1',
          accountId: 'a1',
          type: 'expense',
          amount: 25.5,
          currency: 'PEN',
          description: 'Comida',
          occurredAt: new Date('2026-01-01T00:00:00Z').toISOString(),
          createdAt: new Date('2026-01-01T00:00:00Z').toISOString(),
          updatedAt: new Date('2026-01-01T00:00:00Z').toISOString(),
        },
        {
          id: 't2',
          userId: 'u1',
          accountId: 'a1',
          type: 'income',
          amount: 50,
          currency: 'PEN',
          description: 'Sueldo',
          occurredAt: new Date('2026-01-02T00:00:00Z').toISOString(),
          createdAt: new Date('2026-01-02T00:00:00Z').toISOString(),
          updatedAt: new Date('2026-01-02T00:00:00Z').toISOString(),
        },
      ],
    })

    expect(kpis.totalGastos).toBeCloseTo(25.5)
    expect(kpis.totalIngresos).toBeCloseTo(50)
    expect(kpis.saldoActual).toBeCloseTo(124.5)
  })
})

