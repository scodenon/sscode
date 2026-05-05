export function toMinorUnits(amount: number): number {
  if (!Number.isFinite(amount)) return NaN
  return Math.round(amount * 100)
}

export function fromMinorUnits(amount: number): number {
  return amount / 100
}

