import { useMemo } from 'react'

type Punto = {
  x: string
  y: number
}

type Serie = {
  nombre: string
  color: string
  puntos: Punto[]
}

type Props = {
  series: Serie[]
  height?: number
}

function clamp(n: number) {
  if (!Number.isFinite(n)) return 0
  return n
}

export function LineaSimple({ series, height = 180 }: Props) {
  const { width, padding, minY, maxY, xs } = useMemo(() => {
    const width = 640
    const padding = 24
    const all = series.flatMap((s) => s.puntos)
    const ys = all.map((p) => clamp(p.y))
    const minY = ys.length ? Math.min(...ys) : 0
    const maxY = ys.length ? Math.max(...ys) : 0
    const xs = all.map((p) => p.x)
    return { width, padding, minY, maxY, xs }
  }, [series])

  const scaleX = useMemo(() => {
    const labels = [...new Set(xs)]
    const n = Math.max(labels.length - 1, 1)
    return (x: string) => {
      const idx = Math.max(labels.indexOf(x), 0)
      return padding + (idx / n) * (width - padding * 2)
    }
  }, [padding, width, xs])

  const scaleY = useMemo(() => {
    const span = maxY - minY
    const safe = span === 0 ? 1 : span
    return (y: number) => {
      const t = (clamp(y) - minY) / safe
      return height - padding - t * (height - padding * 2)
    }
  }, [height, maxY, minY, padding])

  return (
    <div className="w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/40">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[180px] w-full">
        <rect x={0} y={0} width={width} height={height} fill="transparent" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.08)" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="rgba(255,255,255,0.08)" />

        {series.map((s) => {
          const d = s.puntos
            .map((p, i) => {
              const x = scaleX(p.x)
              const y = scaleY(p.y)
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
            })
            .join(' ')

          return (
            <g key={s.nombre}>
              <path d={d} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
              {s.puntos.map((p) => (
                <circle key={p.x} cx={scaleX(p.x)} cy={scaleY(p.y)} r={2.5} fill={s.color} />
              ))}
            </g>
          )
        })}
      </svg>
      <div className="flex flex-wrap gap-3 px-4 pb-3 text-xs text-zinc-300">
        {series.map((s) => (
          <div key={s.nombre} className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
            <span>{s.nombre}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
