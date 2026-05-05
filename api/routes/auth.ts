import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../db/prisma.js'
import { env } from '../config/env.js'
import { conflict, unauthorized } from '../errors.js'
import { validateBody } from '../middleware/validate.js'

const router = Router()

/**
 * User Login
 * POST /api/auth/register
 */
const RegisterSchema = z.object({
  email: z.string().email('Email inválido').max(254),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(200),
  name: z.string().min(1, 'El nombre no puede estar vacío').max(80).optional(),
})

const LoginSchema = z.object({
  email: z.string().email('Email inválido').max(254),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(200),
})

function signToken(userId: string) {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: '7d' })
}

router.post(
  '/register',
  validateBody(RegisterSchema),
  async (req: Request, res: Response, next): Promise<void> => {
    try {
      const email = req.body.email.toLowerCase()
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) return next(conflict('El email ya está registrado'))

      const passwordHash = await bcrypt.hash(req.body.password, 10)
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name: req.body.name,
        },
        select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
      })

      res.status(201).json({ token: signToken(user.id), user })
    } catch (e) {
      next(e)
    }
  },
)

/**
 * User Login
 * POST /api/auth/login
 */
router.post(
  '/login',
  validateBody(LoginSchema),
  async (req: Request, res: Response, next): Promise<void> => {
    try {
      const email = req.body.email.toLowerCase()
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) return next(unauthorized('Email o contraseña incorrectos'))

      const ok = await bcrypt.compare(req.body.password, user.passwordHash)
      if (!ok) return next(unauthorized('Email o contraseña incorrectos'))

      res.json({
        token: signToken(user.id),
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      })
    } catch (e) {
      next(e)
    }
  },
)

/**
 * User Logout
 * POST /api/auth/logout
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  res.status(204).send()
})

export default router
