import { cn } from '@/lib/utils'

import type React from 'react'

type Props = {
  open: boolean
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  onClose: () => void
}

export function Modal({ open, title, children, footer, onClose }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className={cn(
            'w-full max-w-xl animate-scale-in rounded-2xl border border-zinc-800 bg-zinc-950/70 shadow-lift backdrop-blur',
          )}
          role="dialog"
          aria-modal="true"
        >
          <div className="border-b border-zinc-800 px-5 py-4">
            <div className="text-base font-semibold text-zinc-100">{title}</div>
          </div>
          <div className="px-5 py-4">{children}</div>
          {footer ? (
            <div className="border-t border-zinc-800 px-5 py-4">{footer}</div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
