import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ApiClientError } from '@/api/types'
import { useAuthStore } from '@/store/authStore'

import type React from 'react'

type FormErrors = Record<string, string>

export default function Login() {
  const login = useAuthStore((s) => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({})

  const navigate = useNavigate()
  const location = useLocation()

  const from = useMemo(() => {
    const state = location.state as { from?: string } | null
    return state?.from ?? '/dashboard'
  }, [location.state])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setGeneralError(null)
    setFieldErrors({})

    try {
      await login({ email, password })
      navigate(from, { replace: true })
    } catch (err) {
      if (err instanceof ApiClientError) {
        setGeneralError(err.message)
        const next: FormErrors = {}
        for (const d of err.details ?? []) next[d.path] = d.message
        setFieldErrors(next)
      } else {
        setGeneralError('Error inesperado. Intenta de nuevo.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-6 py-12 lg:grid-cols-2 lg:py-20">
        <div className="hidden lg:flex lg:flex-col lg:justify-center">
          <div className="text-3xl font-semibold tracking-tight">Gestor de Dinero</div>
          <div className="mt-3 max-w-md text-sm text-zinc-400">
            Inicia sesión para gestionar tus cuentas y transacciones.
          </div>
        </div>
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="text-xl font-semibold">Iniciar sesión</div>
              <div className="mt-1 text-sm text-zinc-400">
                Usa tu email y contraseña.
              </div>
            </CardHeader>
            <CardBody>
              <form onSubmit={onSubmit} className="space-y-4">
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={fieldErrors.email}
                />

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-zinc-100" htmlFor="password">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={
                        'h-10 w-full rounded-md border bg-zinc-950 px-3 pr-10 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:ring-2 ' +
                        (fieldErrors.password
                          ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30'
                          : 'border-zinc-800 focus:border-blue-500 focus:ring-blue-500/30')
                      }
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-400 hover:bg-white/10 hover:text-zinc-100"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {fieldErrors.password ? (
                    <div className="text-xs text-red-300">{fieldErrors.password}</div>
                  ) : null}
                </div>

                {generalError ? (
                  <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                    {generalError}
                  </div>
                ) : null}

                <Button type="submit" disabled={submitting} className="w-full">
                  <Mail className="h-4 w-4" />
                  Entrar
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <div className="text-zinc-400">¿No tienes cuenta?</div>
                  <Link className="text-blue-400 hover:text-blue-300" to="/register">
                    Crear cuenta
                  </Link>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-2 text-xs text-zinc-500">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Sesión por token
                  </div>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
