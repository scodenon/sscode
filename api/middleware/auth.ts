import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { unauthorized } from '../errors.js'

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header('authorization')
  if (!header) return next(unauthorized('Falta el header Authorization'))

  const [type, token] = header.split(' ')
  if (type !== 'Bearer' || !token) {
    return next(unauthorized('Header Authorization inválido'))
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET)
    if (typeof payload !== 'object' || payload === null) {
      return next(unauthorized('Token inválido'))
    }
    const sub = (payload as { sub?: unknown }).sub
    if (typeof sub !== 'string' || !sub) {
      return next(unauthorized('Token inválido'))
    }
    req.userId = sub
    return next()
  } catch {
    return next(unauthorized('Token inválido'))
  }
}

