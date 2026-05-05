import { useMemo } from 'react'

type Item = {
  etiqueta: string
  valor: number
}

type Props = {
  items: Item[]
  maxItems?: number
  colorClassName?: string
}

export function BarrasHorizontales({ items, maxItems = 8, colorClassName = 'bg-blue-500' }: Props) {
  const top = useMemo(() => items.slice(0, maxItems), [items, maxItems])
  const max = useMemo(() => {
    const m = Math.max(0, ...top.map((i) => i.valor))
    return m === 0 ? 1 : m
  }, [top])

  return (
    <div className="space-y-3">
      {top.map((i) => {
        const pct = Math.max(0, Math.min(100, (i.valor / max) * 100))
        return (
          <div key={i.etiqueta} className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-xs text-zinc-300">
              <div className="truncate">{i.etiqueta}</div>
              <div className="shrink-0">{pct.toFixed(0)}%</div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded bg-zinc-800">
              <div className={`h-full ${colorClassName}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
