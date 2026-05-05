import { Prisma } from '@prisma/client'

export type ErrorDetail = { path: string; message: string }

export class ApiError extends Error {
  status: number
  code: string
  details?: ErrorDetail[]

  constructor(
    status: number,
    code: string,
    message: string,
    details?: ErrorDetail[],
  ) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

export function asApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2021' || error.code === 'P2022') {
      return new ApiError(
        500,
        'DB_SCHEMA_MISMATCH',
        'La base de datos no está actualizada. Ejecuta las migraciones y reinicia el servidor.',
      )
    }
    if (error.code === 'P2002') {
      const target = (error.meta?.target as string[] | string | undefined) ?? undefined
      const fields = Array.isArray(target) ? target : typeof target === 'string' ? [target] : []
      return new ApiError(
        409,
        'CONFLICT',
        'Ya existe un registro con esos datos.',
        fields.length ? fields.map((f) => ({ path: f, message: 'Duplicado' })) : undefined,
      )
    }
    if (error.code === 'P2025') {
      return new ApiError(404, 'NOT_FOUND', 'Recurso no encontrado.')
    }
    if (error.code === 'P2003') {
      return new ApiError(400, 'VALIDATION_ERROR', 'Referencia inválida.')
    }
    if (error.code.startsWith('P1')) {
      return new ApiError(503, 'DB_UNAVAILABLE', 'No se puede conectar a la base de datos.')
    }
  }
  if (error instanceof Prisma.PrismaClientValidationError) {
    return new ApiError(400, 'VALIDATION_ERROR', 'Solicitud inválida.')
  }
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return new ApiError(503, 'DB_INIT_ERROR', 'No se pudo inicializar la base de datos.')
  }
  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return new ApiError(500, 'DB_INTERNAL_ERROR', 'Error interno de base de datos.')
  }
  if (error instanceof Error) {
    return new ApiError(500, 'INTERNAL_ERROR', 'Error interno del servidor')
  }
  return new ApiError(500, 'INTERNAL_ERROR', 'Error interno del servidor')
}

export function notFound(message = 'No encontrado'): ApiError {
  return new ApiError(404, 'NOT_FOUND', message)
}

export function unauthorized(message = 'No autorizado'): ApiError {
  return new ApiError(401, 'UNAUTHORIZED', message)
}

export function forbidden(message = 'Prohibido'): ApiError {
  return new ApiError(403, 'FORBIDDEN', message)
}

export function conflict(message = 'Conflicto'): ApiError {
  return new ApiError(409, 'CONFLICT', message)
}

