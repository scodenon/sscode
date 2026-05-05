import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { prisma } from '../db/prisma.js'
import { notFound } from '../errors.js'
import { validateBody } from '../middleware/validate.js'

const router = Router()

const UpdateMeSchema = z
  .object({
    name: z
      .string()
      .min(1, 'El nombre no puede estar vacío')
      .max(80)
      .nullable()
      .optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'El cuerpo no puede estar vacío' })

router.get('/', requireAuth, async (req: Request, res: Response, next) => {
  try {
    const userId = req.userId
    if (!userId) return next(notFound())

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
    })

    if (!user) return next(notFound('Usuario no encontrado'))

    res.json({ user })
  } catch (e) {
    next(e)
  }
})

router.patch(
  '/',
  requireAuth,
  validateBody(UpdateMeSchema),
  async (req: Request, res: Response, next) => {
    try {
      const userId = req.userId
      if (!userId) return next(notFound())

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          name: req.body.name === undefined ? undefined : req.body.name,
        },
        select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
      })

      res.json({ user })
    } catch (e) {
      next(e)
    }
  },
)

export default router

