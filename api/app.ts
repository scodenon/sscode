import express, { type Request, type Response } from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import meRoutes from './routes/me.js'
import accountsRoutes from './routes/accounts.js'
import transactionsRoutes from './routes/transactions.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use('/api/auth', authRoutes)
app.use('/api/me', meRoutes)
app.use('/api/accounts', accountsRoutes)
app.use('/api/transactions', transactionsRoutes)

app.use(
  '/api/health',
  (req: Request, res: Response): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

app.use(errorHandler)

app.use(notFoundHandler)

export default app
