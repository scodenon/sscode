import { ApiClientError, type ApiErrorBody } from '@/api/types'

type ApiClientConfig = {
  baseUrl?: string
  getToken: () => string | null
  onUnauthorized: () => void
}

let config: ApiClientConfig | null = null

export function configureApiClient(next: ApiClientConfig) {
  config = next
}

function joinUrl(baseUrl: string, path: string) {
  if (!baseUrl) return path
  const a = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  const b = path.startsWith('/') ? path : `/${path}`
  return `${a}${b}`
}

async function readJsonSafely(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function asApiErrorBody(body: unknown): ApiErrorBody | null {
  if (!body || typeof body !== 'object') return null
  const root = body as Record<string, unknown>
  const err = root.error as Record<string, unknown> | undefined
  if (!err || typeof err !== 'object') return null
  if (typeof err.code !== 'string' || typeof err.message !== 'string') return null
  return body as ApiErrorBody
}

export async function apiRequest<T>(
  method: string,
  path: string,
  input?: { body?: unknown; query?: Record<string, string | undefined> },
): Promise<T> {
  if (!config) {
    throw new Error('Cliente API no configurado')
  }

  const query = input?.query
    ? `?${new URLSearchParams(
        Object.fromEntries(Object.entries(input.query).filter(([, v]) => v !== undefined)) as Record<
          string,
          string
        >,
      ).toString()}`
    : ''

  const url = joinUrl(config.baseUrl ?? '', `${path}${query}`)
  const token = config.getToken()

  const res = await fetch(url, {
    method,
    headers: {
      ...(input?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: input?.body ? JSON.stringify(input.body) : undefined,
  })

  if (res.status === 204) {
    return undefined as T
  }

  if (!res.ok) {
    const body = await readJsonSafely(res)
    const apiError = asApiErrorBody(body)
    if (res.status === 401) config.onUnauthorized()
    if (apiError) {
      throw new ApiClientError({
        status: res.status,
        code: apiError.error.code,
        message: apiError.error.message,
        details: apiError.error.details,
      })
    }
    throw new ApiClientError({
      status: res.status,
      code: 'HTTP_ERROR',
      message: `La solicitud falló (${res.status})`,
    })
  }

  return (await res.json()) as T
}
