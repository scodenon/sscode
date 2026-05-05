import { describe, expect, it } from 'vitest'
import { formatMoney } from '@/utils/money'

describe('money utils', () => {
  it('formats currency with Intl when possible', () => {
    const s = formatMoney(12.5, 'USD')
    expect(typeof s).toBe('string')
    expect(s.length).toBeGreaterThan(0)
  })

  it('handles invalid numbers', () => {
    expect(formatMoney(Number.NaN, 'USD')).toBe('NaN')
  })
})

