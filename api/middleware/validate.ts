import type { NextFunction, Request, Response } from 'express'
import type { ZodTypeAny } from 'zod'
import { ApiError } from '../errors.js'

export function validateBody(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
      return next(
        new ApiError(
          400,
          'VALIDATION_ERROR',
          'Solicitud inválida',
          parsed.error.issues.map((i) => ({
            path: i.path.join('.'),
            message: i.message,
          })),
        ),
      )
    }
    req.body = parsed.data
    return next()
  }
}

