export type ErrorDetail = { path: string; message: string }

export type ApiErrorBody = {
  error: {
    code: string
    message: string
    details?: ErrorDetail[]
  }
}

export class ApiClientError extends Error {
  status: number
  code: string
  details?: ErrorDetail[]

  constructor(input: { status: number; code: string; message: string; details?: ErrorDetail[] }) {
    super(input.message)
    this.status = input.status
    this.code = input.code
    this.details = input.details
  }
}

export type User = {
  id: string
  email: string
  name: string | null
  createdAt?: string
  updatedAt?: string
}

export type AccountType = 'cash' | 'bank' | 'credit' | 'other'

export type Account = {
  id: string
  userId: string
  name: string
  type: AccountType
  currency: string
  initialBalance: number
  balanceStartAt?: string
  createdAt: string
  updatedAt: string
}

export type TransactionType = 'income' | 'expense'

export type Transaction = {
  id: string
  userId: string
  accountId: string
  type: TransactionType
  amount: number
  currency: string
  category?: string | null
  description: string | null
  occurredAt: string
  createdAt: string
  updatedAt: string
}
