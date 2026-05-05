import { cn } from '@/lib/utils'

import type React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
}

const variantClass: Record<NonNullable<Props['variant']>, string> = {
  primary:
    'bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-soft hover:shadow-lift active:shadow-soft disabled:opacity-60',
  secondary:
    'border border-zinc-800 bg-zinc-900/50 text-zinc-100 shadow-soft hover:bg-zinc-900 hover:shadow-lift active:shadow-soft disabled:opacity-60',
  danger:
    'bg-gradient-to-b from-red-500 to-red-700 text-white shadow-soft hover:shadow-lift active:shadow-soft disabled:opacity-60',
  ghost:
    'bg-transparent text-zinc-100 hover:bg-white/10 active:bg-white/5 disabled:opacity-60',
}

export function Button({ className, variant = 'primary', ...props }: Props) {
  return (
    <button
      className={cn(
        'inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-[transform,box-shadow,background-color,color,border-color] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:cursor-not-allowed active:scale-[0.99]',
        variantClass[variant],
        className,
      )}
      {...props}
    />
  )
}
