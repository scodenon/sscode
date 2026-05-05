import { apiRequest } from '@/api/client'
import type { Account, Transaction, User } from '@/api/types'

export async function apiRegister(input: { email: string; password: string; name?: string }) {
  return apiRequest<{ token: string; user: User }>('POST', '/api/auth/register', { body: input })
}

export async function apiLogin(input: { email: string; password: string }) {
  return apiRequest<{ token: string; user: User }>('POST', '/api/auth/login', { body: input })
}

export async function apiMe() {
  return apiRequest<{ user: User }>('GET', '/api/me')
}

export async function apiListAccounts() {
  return apiRequest<{ items: Account[] }>('GET', '/api/accounts')
}

export async function apiCreateAccount(input: {
  name: string
  type: Account['type']
  currency: string
  initialBalance: number
}) {
  return apiRequest<{ account: Account }>('POST', '/api/accounts', { body: input })
}

export async function apiUpdateAccount(id: string, input: Partial<Pick<Account, 'name' | 'type' | 'currency' | 'initialBalance'>>) {
  return apiRequest<{ account: Account }>('PATCH', `/api/accounts/${id}`, { body: input })
}

export async function apiDeleteAccount(id: string) {
  return apiRequest<void>('DELETE', `/api/accounts/${id}`)
}

export async function apiListTransactions(accountId?: string) {
  return apiRequest<{ items: Transaction[] }>('GET', '/api/transactions', {
    query: { accountId },
  })
}

export async function apiCreateTransaction(input: {
  accountId: string
  type: Transaction['type']
  amount: number
  currency: string
  category?: string
  description?: string
  occurredAt: string
}) {
  return apiRequest<{ transaction: Transaction }>('POST', '/api/transactions', { body: input })
}

export async function apiUpdateTransaction(
  id: string,
  input: Partial<Pick<Transaction, 'type' | 'amount' | 'currency' | 'category' | 'description' | 'occurredAt'>>,
) {
  return apiRequest<{ transaction: Transaction }>('PATCH', `/api/transactions/${id}`, { body: input })
}

export async function apiDeleteTransaction(id: string) {
  return apiRequest<void>('DELETE', `/api/transactions/${id}`)
}
