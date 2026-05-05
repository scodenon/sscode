import { cn } from '@/lib/utils'

import type React from 'react'

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export function Input({ className, label, error, id, ...props }: Props) {
  const inputId = id ?? props.name

  return (
    <div className="space-y-1">
      {label ? (
        <label htmlFor={inputId} className="block text-sm font-medium text-zinc-100">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={cn(
          'h-10 w-full rounded-xl border bg-zinc-950/40 px-3 text-sm text-zinc-100 shadow-soft outline-none transition-[box-shadow,border-color,background-color] duration-150 ease-out placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
          error
            ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30'
            : 'border-zinc-800 focus:border-blue-500 focus:ring-blue-500/30',
          className,
        )}
        {...props}
      />
      {error ? <div className="text-xs text-red-300">{error}</div> : null}
    </div>
  )
}
