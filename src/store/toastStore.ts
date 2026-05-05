import { create } from 'zustand'

export type ToastVariant = 'success' | 'error' | 'info'

export type Toast = {
  id: string
  title: string
  description?: string
  variant: ToastVariant
}

type ToastState = {
  toasts: Toast[]
  push: (t: Omit<Toast, 'id'> & { id?: string; timeoutMs?: number }) => void
  dismiss: (id: string) => void
}

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: ({ id, timeoutMs = 3500, ...t }) => {
    const toastId = id ?? uid()
    set({ toasts: [...get().toasts, { id: toastId, ...t }] })
    if (timeoutMs > 0) {
      setTimeout(() => {
        get().dismiss(toastId)
      }, timeoutMs)
    }
  },
  dismiss: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) })
  },
}))

