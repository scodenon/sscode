import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { BarChart3, LayoutDashboard, LineChart, Menu, Moon, Sun, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'

type NavItem = {
  to: string
  label: string
  icon: ReactNode
}

type Props = {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}

function ShellLink({ to, label, icon }: NavItem) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-[background-color,box-shadow,transform,color] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
          isActive
            ? 'bg-white/10 text-zinc-50 shadow-soft'
            : 'text-zinc-300 hover:bg-white/5 hover:text-zinc-50',
        )
      }
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-zinc-100 shadow-soft transition-colors group-hover:bg-white/10">
        {icon}
      </span>
      <span className="min-w-0 truncate">{label}</span>
    </NavLink>
  )
}

export function AppShell({ title, subtitle, actions, children }: Props) {
  const { isDark, toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)

  const nav = useMemo<NavItem[]>(
    () => [
      { to: '/dashboard', label: 'Panel', icon: <LayoutDashboard className="h-4 w-4" /> },
      { to: '/resumen', label: 'Resumen', icon: <BarChart3 className="h-4 w-4" /> },
      { to: '/reportes', label: 'Reportes', icon: <LineChart className="h-4 w-4" /> },
    ],
    [],
  )

  return (
    <div className="min-h-dvh">
      <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-[280px_1fr]">
        <aside className="sticky top-0 hidden h-dvh border-r border-white/5 bg-zinc-950/30 p-4 backdrop-blur md:block">
          <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 shadow-soft">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-b from-blue-500/30 to-purple-500/10 text-zinc-50 shadow-soft">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-zinc-50">Gestor</div>
              <div className="truncate text-xs text-zinc-400">Finanzas personales</div>
            </div>
          </div>

          <nav className="mt-4 space-y-2">
            {nav.map((n) => (
              <ShellLink key={n.to} {...n} />
            ))}
          </nav>

          <div className="mt-4">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm text-zinc-200 shadow-soft transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            >
              <span className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5">
                  {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </span>
                Tema
              </span>
              <span className="text-xs text-zinc-400">{isDark ? 'Oscuro' : 'Claro'}</span>
            </button>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-white/5 bg-zinc-950/30 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <div className="flex min-w-0 items-center gap-2">
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-100 shadow-soft transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 md:hidden"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Abrir navegación"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="min-w-0">
                  <div className="truncate text-base font-semibold text-zinc-50">{title}</div>
                  {subtitle ? <div className="truncate text-xs text-zinc-400">{subtitle}</div> : null}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-100 shadow-soft transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 md:hidden"
                  aria-label="Cambiar tema"
                >
                  {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </button>
                {actions}
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 md:pb-10">
            <div className="animate-fade-up">{children}</div>
          </main>
        </div>
      </div>

      <div className={cn('fixed inset-0 z-40 md:hidden', mobileOpen ? '' : 'pointer-events-none')}>
        <div
          className={cn(
            'absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-150',
            mobileOpen ? 'opacity-100' : 'opacity-0',
          )}
          onClick={() => setMobileOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Cerrar"
        />
        <div
          className={cn(
            'absolute left-0 top-0 h-dvh w-[86%] max-w-sm border-r border-white/10 bg-zinc-950/80 p-4 shadow-lift backdrop-blur transition-transform duration-150 ease-out',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          )}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-zinc-50">Navegación</div>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-100 shadow-soft hover:bg-white/10"
              onClick={() => setMobileOpen(false)}
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-4 space-y-2">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
                    isActive ? 'bg-white/10 text-zinc-50' : 'text-zinc-300 hover:bg-white/5 hover:text-zinc-50',
                  )
                }
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5">
                  {n.icon}
                </span>
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <nav className="fixed bottom-4 left-1/2 z-30 w-[min(520px,calc(100%-2rem))] -translate-x-1/2 rounded-2xl border border-white/10 bg-zinc-950/60 p-1 shadow-lift backdrop-blur md:hidden">
        <div className="grid grid-cols-3 gap-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              cn(
                'flex h-12 items-center justify-center gap-2 rounded-2xl text-sm transition-colors',
                isActive ? 'bg-white/10 text-zinc-50' : 'text-zinc-300 hover:bg-white/5 hover:text-zinc-50',
              )
            }
            aria-label="Panel"
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="hidden sm:inline">Panel</span>
          </NavLink>
          <NavLink
            to="/resumen"
            className={({ isActive }) =>
              cn(
                'flex h-12 items-center justify-center gap-2 rounded-2xl text-sm transition-colors',
                isActive ? 'bg-white/10 text-zinc-50' : 'text-zinc-300 hover:bg-white/5 hover:text-zinc-50',
              )
            }
            aria-label="Resumen"
          >
            <BarChart3 className="h-5 w-5" />
            <span className="hidden sm:inline">Resumen</span>
          </NavLink>
          <NavLink
            to="/reportes"
            className={({ isActive }) =>
              cn(
                'flex h-12 items-center justify-center gap-2 rounded-2xl text-sm transition-colors',
                isActive ? 'bg-white/10 text-zinc-50' : 'text-zinc-300 hover:bg-white/5 hover:text-zinc-50',
              )
            }
            aria-label="Reportes"
          >
            <LineChart className="h-5 w-5" />
            <span className="hidden sm:inline">Reportes</span>
          </NavLink>
        </div>
      </nav>
    </div>
  )
}
