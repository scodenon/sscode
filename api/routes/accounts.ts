import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import { prisma } from '../db/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'
import { ApiError, notFound } from '../errors.js'
import { fromMinorUnits, toMinorUnits } from '../utils/money.js'
import { aplicarRolloverMensual } from '../utils/rollover.js'

const router = Router()

const CreateAccountSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(80),
  type: z.enum(['cash', 'bank', 'credit', 'other']),
  currency: z.string().min(3, 'La moneda es requerida').max(10),
  initialBalance: z.number(),
})

const UpdateAccountSchema = z
  .object({
    name: z.string().min(1, 'El nombre es requerido').max(80).optional(),
    type: z.enum(['cash', 'bank', 'credit', 'other']).optional(),
    currency: z.string().min(3, 'La moneda es requerida').max(10).optional(),
    initialBalance: z.number().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'El cuerpo no puede estar vacío' })

router.get('/', requireAuth, async (req: Request, res: Response, next) => {
  try {
    const userId = req.userId!
    await aplicarRolloverMensual(userId)
    const items = await prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    res.json({
      items: items.map((a) => ({
        ...a,
        initialBalance: fromMinorUnits(a.initialBalance),
      })),
    })
  } catch (e) {
    next(e)
  }
})

router.post(
  '/',
  requireAuth,
  validateBody(CreateAccountSchema),
  async (req: Request, res: Response, next) => {
    try {
      const userId = req.userId!
      const minor = toMinorUnits(req.body.initialBalance)
      if (!Number.isFinite(minor)) {
        return next(
          new ApiError(400, 'VALIDATION_ERROR', 'Solicitud inválida', [
            { path: 'initialBalance', message: 'Número inválido' },
          ]),
        )
      }

      const account = await prisma.account.create({
        data: {
          userId,
          name: req.body.name,
          type: req.body.type,
          currency: req.body.currency,
          initialBalance: minor,
        },
      })

      res.status(201).json({
        account: {
          ...account,
          initialBalance: fromMinorUnits(account.initialBalance),
        },
      })
    } catch (e) {
      next(e)
    }
  },
)

router.get('/:id', requireAuth, async (req: Request, res: Response, next) => {
  try {
    const userId = req.userId!
    const account = await prisma.account.findFirst({
      where: { id: req.params.id, userId },
    })
    if (!account) return next(notFound('Cuenta no encontrada'))
    res.json({
      account: {
        ...account,
        initialBalance: fromMinorUnits(account.initialBalance),
      },
    })
  } catch (e) {
    next(e)
  }
})

router.patch(
  '/:id',
  requireAuth,
  validateBody(UpdateAccountSchema),
  async (req: Request, res: Response, next) => {
    try {
      const userId = req.userId!
      const existing = await prisma.account.findFirst({
        where: { id: req.params.id, userId },
      })
      if (!existing) return next(notFound('Cuenta no encontrada'))

      const initialBalance =
        req.body.initialBalance === undefined
          ? undefined
          : toMinorUnits(req.body.initialBalance)

      if (
        initialBalance !== undefined &&
        !Number.isFinite(initialBalance)
      ) {
        return next(
          new ApiError(400, 'VALIDATION_ERROR', 'Solicitud inválida', [
            { path: 'initialBalance', message: 'Número inválido' },
          ]),
        )
      }

      const updated = await prisma.account.update({
        where: { id: existing.id },
        data: {
          name: req.body.name,
          type: req.body.type,
          currency: req.body.currency,
          initialBalance,
        },
      })

      res.json({
        account: {
          ...updated,
          initialBalance: fromMinorUnits(updated.initialBalance),
        },
      })
    } catch (e) {
      next(e)
    }
  },
)

router.delete('/:id', requireAuth, async (req: Request, res: Response, next) => {
  try {
    const userId = req.userId!
    const existing = await prisma.account.findFirst({
      where: { id: req.params.id, userId },
    })
    if (!existing) return next(notFound('Cuenta no encontrada'))
    await prisma.account.delete({ where: { id: existing.id } })
    res.status(204).send()
  } catch (e) {
    next(e)
  }
})

export default router

