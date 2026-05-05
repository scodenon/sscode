import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Dashboard from '@/pages/Dashboard'
import Reportes from '@/pages/Reportes'
import ResumenMensual from '@/pages/ResumenMensual'
import NotFound from '@/pages/NotFound'
import { ToastHost } from '@/components/ToastHost'
import RequireAuth from '@/components/RequireAuth'
import { configureApiClient } from '@/api/client'
import { useAuthStore } from '@/store/authStore'

export default function App() {
  const bootstrap = useAuthStore((s) => s.bootstrap)
  const status = useAuthStore((s) => s.status)
  const token = useAuthStore((s) => s.token)
  const logout = useAuthStore((s) => s.logout)

  useEffect(() => {
    configureApiClient({
      getToken: () => useAuthStore.getState().token,
      onUnauthorized: () => logout(),
      baseUrl: import.meta.env.VITE_API_BASE_URL,
    })
    void bootstrap()
  }, [bootstrap, logout])

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={token ? '/dashboard' : '/login'} replace />}
        />
        <Route
          path="/login"
          element={status === 'authenticated' ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={status === 'authenticated' ? <Navigate to="/dashboard" replace /> : <Register />}
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/reportes"
          element={
            <RequireAuth>
              <Reportes />
            </RequireAuth>
          }
        />
        <Route
          path="/resumen"
          element={
            <RequireAuth>
              <ResumenMensual />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastHost />
    </Router>
  )
}
