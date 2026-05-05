import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToastStore } from '@/store/toastStore'

const variantClasses: Record<string, string> = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-50',
  error: 'border-red-500/30 bg-red-500/10 text-red-50',
  info: 'border-sky-500/30 bg-sky-500/10 text-sky-50',
}

export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto animate-fade-up rounded-2xl border px-4 py-3 shadow-lift backdrop-blur',
            variantClasses[t.variant] ?? variantClasses.info,
          )}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold leading-5">{t.title}</div>
              {t.description ? (
                <div className="mt-1 text-sm text-white/80">{t.description}</div>
              ) : null}
            </div>
            <button
              type="button"
              className="rounded-xl p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/30"
              onClick={() => dismiss(t.id)}
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
