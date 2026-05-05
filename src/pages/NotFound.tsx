import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-zinc-100">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div className="text-lg font-semibold">Página no encontrada</div>
        <div className="mt-2 text-sm text-zinc-400">
          La ruta que intentas abrir no existe.
        </div>
        <div className="mt-4">
          <Link className="text-sm text-blue-400 hover:text-blue-300" to="/">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}

