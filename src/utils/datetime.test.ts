import { describe, expect, it } from 'vitest'
import { datetimeLocalToIso, isoToDatetimeLocal } from '@/utils/datetime'

describe('datetime utils', () => {
  it('converts datetime-local to ISO and back', () => {
    const local = '2026-05-05T10:30'
    const iso = datetimeLocalToIso(local)
    expect(iso).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:/)
    const back = isoToDatetimeLocal(iso)
    expect(back).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)
  })

  it('returns empty string for invalid inputs', () => {
    expect(datetimeLocalToIso('')).toBe('')
    expect(datetimeLocalToIso('not-a-date')).toBe('')
    expect(isoToDatetimeLocal('')).toBe('')
    expect(isoToDatetimeLocal('not-a-date')).toBe('')
  })
})

