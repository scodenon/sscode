import { create } from 'zustand'
import type { User } from '@/api/types'
import { ApiClientError } from '@/api/types'
import { apiLogin, apiMe, apiRegister } from '@/api/endpoints'

type AuthStatus = 'bootstrapping' | 'anonymous' | 'authenticated'

type AuthState = {
  status: AuthStatus
  token: string | null
  user: User | null
  bootstrap: () => Promise<void>
  login: (input: { email: string; password: string }) => Promise<void>
  register: (input: { email: string; password: string; name?: string }) => Promise<void>
  logout: () => void
}

const storageKey = 'moneyapp_token'

function readToken() {
  try {
    const v = localStorage.getItem(storageKey)
    return v && v.trim().length > 0 ? v : null
  } catch {
    return null
  }
}

function writeToken(token: string | null) {
  try {
    if (!token) localStorage.removeItem(storageKey)
    else localStorage.setItem(storageKey, token)
  } catch {
    return
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'bootstrapping',
  token: null,
  user: null,
  bootstrap: async () => {
    const token = readToken()
    if (!token) {
      set({ status: 'anonymous', token: null, user: null })
      return
    }

    set({ status: 'bootstrapping', token, user: null })

    try {
      const { user } = await apiMe()
      set({ status: 'authenticated', token, user })
    } catch (e) {
      if (e instanceof ApiClientError && e.status === 401) {
        writeToken(null)
        set({ status: 'anonymous', token: null, user: null })
        return
      }
      set({ status: 'anonymous', token: null, user: null })
    }
  },
  login: async ({ email, password }) => {
    const { token, user } = await apiLogin({ email, password })
    writeToken(token)
    set({ status: 'authenticated', token, user })
  },
  register: async ({ email, password, name }) => {
    const { token, user } = await apiRegister({ email, password, name })
    writeToken(token)
    set({ status: 'authenticated', token, user })
  },
  logout: () => {
    writeToken(null)
    set({ status: 'anonymous', token: null, user: null })
  },
}))
