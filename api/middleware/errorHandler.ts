import type { NextFunction, Request, Response } from 'express'
import { ApiError, asApiError } from '../errors.js'

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  void _next
  const apiError = asApiError(error)
  const body: {
    error: {
      code: string
      message: string
      details?: { path: string; message: string }[]
    }
  } = {
    error: {
      code: apiError.code,
      message: apiError.message,
      details: apiError.details,
    },
  }

  if (body.error.details === undefined) delete body.error.details

  res.status(apiError.status).json(body)
}

export function notFoundHandler(req: Request, res: Response) {
  const error = new ApiError(404, 'NOT_FOUND', 'Ruta no encontrada')
  res.status(error.status).json({
    error: {
      code: error.code,
      message: error.message,
    },
  })
}

