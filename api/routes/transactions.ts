import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import { prisma } from '../db/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'
import { ApiError, notFound } from '../errors.js'
import { fromMinorUnits, toMinorUnits } from '../utils/money.js'
import { aplicarRolloverMensual } from '../utils/rollover.js'

const router = Router()

const CreateTransactionSchema = z.object({
  accountId: z.string().min(1, 'La cuenta es requerida'),
  type: z.enum(['income', 'expense']),
  amount: z.number(),
  currency: z.string().min(3, 'La moneda es requerida').max(10),
  category: z.string().min(1, 'La categoría no puede estar vacía').max(50).optional(),
  description: z.string().max(240).optional(),
  occurredAt: z.string().datetime('Fecha inválida'),
})

const UpdateTransactionSchema = z
  .object({
    type: z.enum(['income', 'expense']).optional(),
    amount: z.number().optional(),
    currency: z.string().min(3, 'La moneda es requerida').max(10).optional(),
    category: z.string().min(1, 'La categoría no puede estar vacía').max(50).optional().nullable(),
    description: z.string().max(240).optional().nullable(),
    occurredAt: z.string().datetime('Fecha inválida').optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'El cuerpo no puede estar vacío' })

router.get('/', requireAuth, async (req: Request, res: Response, next) => {
  try {
    const userId = req.userId!
    await aplicarRolloverMensual(userId)
    const accountId =
      typeof req.query.accountId === 'string' ? req.query.accountId : undefined

    const items = await prisma.transaction.findMany({
      where: {
        userId,
        ...(accountId ? { accountId } : {}),
      },
      orderBy: { occurredAt: 'desc' },
    })

    res.json({
      items: items.map((t) => ({
        ...t,
        amount: fromMinorUnits(t.amount),
      })),
    })
  } catch (e) {
    next(e)
  }
})

router.post(
  '/',
  requireAuth,
  validateBody(CreateTransactionSchema),
  async (req: Request, res: Response, next) => {
    try {
      const userId = req.userId!
      await aplicarRolloverMensual(userId)
      const minor = toMinorUnits(req.body.amount)
      if (!Number.isFinite(minor)) {
        return next(
          new ApiError(400, 'VALIDATION_ERROR', 'Solicitud inválida', [
            { path: 'amount', message: 'Número inválido' },
          ]),
        )
      }

      const account = await prisma.account.findFirst({
        where: { id: req.body.accountId, userId },
      })
      if (!account) return next(notFound('Cuenta no encontrada'))

      const transaction = await prisma.transaction.create({
        data: {
          userId,
          accountId: req.body.accountId,
          type: req.body.type,
          amount: minor,
          currency: req.body.currency,
          category: req.body.category,
          description: req.body.description,
          occurredAt: new Date(req.body.occurredAt),
        },
      })

      res.status(201).json({
        transaction: {
          ...transaction,
          amount: fromMinorUnits(transaction.amount),
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
    const transaction = await prisma.transaction.findFirst({
      where: { id: req.params.id, userId },
    })
    if (!transaction) return next(notFound('Transacción no encontrada'))
    res.json({
      transaction: {
        ...transaction,
        amount: fromMinorUnits(transaction.amount),
      },
    })
  } catch (e) {
    next(e)
  }
})

router.patch(
  '/:id',
  requireAuth,
  validateBody(UpdateTransactionSchema),
  async (req: Request, res: Response, next) => {
    try {
      const userId = req.userId!
      await aplicarRolloverMensual(userId)
      const existing = await prisma.transaction.findFirst({
        where: { id: req.params.id, userId },
      })
      if (!existing) return next(notFound('Transacción no encontrada'))

      const amount = req.body.amount === undefined ? undefined : toMinorUnits(req.body.amount)
      if (amount !== undefined && !Number.isFinite(amount)) {
        return next(
          new ApiError(400, 'VALIDATION_ERROR', 'Solicitud inválida', [
            { path: 'amount', message: 'Número inválido' },
          ]),
        )
      }
      const occurredAt =
        req.body.occurredAt === undefined ? undefined : new Date(req.body.occurredAt)

      const updated = await prisma.transaction.update({
        where: { id: existing.id },
        data: {
          type: req.body.type,
          amount,
          currency: req.body.currency,
          category: req.body.category,
          description: req.body.description,
          occurredAt,
        },
      })

      res.json({
        transaction: {
          ...updated,
          amount: fromMinorUnits(updated.amount),
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
    await aplicarRolloverMensual(userId)
    const existing = await prisma.transaction.findFirst({
      where: { id: req.params.id, userId },
    })
    if (!existing) return next(notFound('Transacción no encontrada'))
    await prisma.transaction.delete({ where: { id: existing.id } })
    res.status(204).send()
  } catch (e) {
    next(e)
  }
})

export default router

