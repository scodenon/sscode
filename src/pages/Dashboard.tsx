import { useEffect, useMemo, useState } from 'react'
import { LogOut, PlusCircle } from 'lucide-react'
import type { Account, Transaction } from '@/api/types'
import { ApiClientError } from '@/api/types'
import { AppShell } from '@/components/layout/AppShell'
import { AccountDialog } from '@/components/dashboard/AccountDialog'
import { AccountsPanel } from '@/components/dashboard/AccountsPanel'
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog'
import { TransactionDialog } from '@/components/dashboard/TransactionDialog'
import { TransactionsPanel } from '@/components/dashboard/TransactionsPanel'
import { Button } from '@/components/ui/Button'
import { useAccounts } from '@/hooks/useAccounts'
import { useTransactions } from '@/hooks/useTransactions'
import { useTransaccionesGlobales } from '@/hooks/useTransaccionesGlobales'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { calcularSaldosActuales } from '@/utils/saldos'

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const pushToast = useToastStore((s) => s.push)

  const accounts = useAccounts()
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
  const transactions = useTransactions(selectedAccountId)
  const transaccionesGlobales = useTransaccionesGlobales()

  const selectedAccount = useMemo(
    () => accounts.items.find((a) => a.id === selectedAccountId) ?? null,
    [accounts.items, selectedAccountId],
  )

  const inicioMes = useMemo(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0)
  }, [])

  const transaccionesMesTodas = useMemo(() => {
    return transaccionesGlobales.items.filter((t) => {
      const ts = new Date(t.occurredAt).getTime()
      return Number.isFinite(ts) && ts >= inicioMes.getTime()
    })
  }, [inicioMes, transaccionesGlobales.items])

  const saldosByAccountId = useMemo(() => {
    return calcularSaldosActuales({
      cuentas: accounts.items,
      transacciones: transaccionesMesTodas,
    })
  }, [accounts.items, transaccionesMesTodas])

  useEffect(() => {
    if (selectedAccountId) return
    if (accounts.items.length > 0) setSelectedAccountId(accounts.items[0].id)
  }, [accounts.items, selectedAccountId])

  const [accountDialogOpen, setAccountDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [deleteAccount, setDeleteAccount] = useState<Account | null>(null)

  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deleteTransaction, setDeleteTransaction] = useState<Transaction | null>(null)
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [newTransactionType, setNewTransactionType] = useState<'income' | 'expense'>('expense')

  async function saveAccount(input: { name: string; type: Account['type']; currency: string; initialBalance: number }) {
    try {
      if (editingAccount) {
        await accounts.update(editingAccount.id, input)
        pushToast({ variant: 'success', title: 'Cuenta actualizada' })
      } else {
        const created = await accounts.create(input)
        pushToast({ variant: 'success', title: 'Cuenta creada' })
        setSelectedAccountId(created.id)
      }
    } catch (e) {
      if (e instanceof ApiClientError) throw e
      throw new Error('No se pudo guardar la cuenta')
    } finally {
      setEditingAccount(null)
    }
  }

  async function confirmDeleteAccount() {
    if (!deleteAccount) return
    try {
      await accounts.remove(deleteAccount.id)
      pushToast({ variant: 'success', title: 'Cuenta eliminada' })
      if (selectedAccountId === deleteAccount.id) {
        const next = accounts.items.filter((a) => a.id !== deleteAccount.id)[0]
        setSelectedAccountId(next?.id ?? null)
      }
    } catch (e) {
      pushToast({ variant: 'error', title: 'No se pudo eliminar', description: e instanceof Error ? e.message : '' })
    } finally {
      setDeleteAccount(null)
    }
  }

  async function saveTransaction(input: {
    accountId: string
    type: Transaction['type']
    amount: number
    currency: string
    category?: string
    description?: string
    occurredAt: string
  }) {
    try {
      if (editingTransaction) {
        await transactions.update(editingTransaction.id, input)
        pushToast({ variant: 'success', title: 'Transacción actualizada' })
      } else {
        await transactions.create(input)
        pushToast({ variant: 'success', title: 'Transacción creada' })
      }
      void transaccionesGlobales.refresh()
      void accounts.refresh()
    } catch (e) {
      if (e instanceof ApiClientError) throw e
      throw new Error('No se pudo guardar la transacción')
    } finally {
      setEditingTransaction(null)
    }
  }

  async function confirmDeleteTransaction() {
    if (!deleteTransaction) return
    try {
      await transactions.remove(deleteTransaction.id)
      pushToast({ variant: 'success', title: 'Transacción eliminada' })
      void transaccionesGlobales.refresh()
      void accounts.refresh()
    } catch (e) {
      pushToast({ variant: 'error', title: 'No se pudo eliminar', description: e instanceof Error ? e.message : '' })
    } finally {
      setDeleteTransaction(null)
    }
  }

  return (
    <AppShell
      title="Panel"
      subtitle={user?.email ? `Sesión: ${user.email}` : 'Sesión activa'}
      actions={
        <>
          <Button
            variant="secondary"
            onClick={() => {
              setEditingAccount(null)
              setAccountDialogOpen(true)
            }}
          >
            <PlusCircle className="h-4 w-4" />
            Cuenta
          </Button>
          <Button variant="ghost" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Salir
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {accounts.error ? (
          <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-100 shadow-soft">
            {accounts.error}
          </div>
        ) : null}
        {transactions.error ? (
          <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-100 shadow-soft">
            {transactions.error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
          <AccountsPanel
            items={accounts.items}
            loading={accounts.loading}
            selectedId={selectedAccountId}
            balancesByAccountId={saldosByAccountId}
            onSelect={(id) => setSelectedAccountId(id)}
            onNew={() => {
              setEditingAccount(null)
              setAccountDialogOpen(true)
            }}
            onEdit={(a) => {
              setEditingAccount(a)
              setAccountDialogOpen(true)
            }}
            onDelete={(a) => setDeleteAccount(a)}
          />

          <TransactionsPanel
            account={selectedAccount}
            items={transactions.items}
            loading={transactions.loading}
            filter={filter}
            onFilterChange={setFilter}
            onNew={(type) => {
              setNewTransactionType(type)
              setEditingTransaction(null)
              setTransactionDialogOpen(true)
            }}
            onEdit={(t) => {
              setEditingTransaction(t)
              setTransactionDialogOpen(true)
            }}
            onDelete={(t) => setDeleteTransaction(t)}
          />
        </div>
      </div>

      <AccountDialog
        open={accountDialogOpen}
        account={editingAccount}
        onClose={() => {
          setAccountDialogOpen(false)
          setEditingAccount(null)
        }}
        onSave={async (input) => saveAccount(input)}
      />

      <ConfirmDialog
        open={Boolean(deleteAccount)}
        title="Eliminar cuenta"
        description="Esto eliminará la cuenta y sus transacciones asociadas."
        confirmText="Eliminar"
        onClose={() => setDeleteAccount(null)}
        onConfirm={confirmDeleteAccount}
      />

      <TransactionDialog
        open={transactionDialogOpen}
        transaction={editingTransaction}
        accounts={accounts.items}
        defaultAccountId={selectedAccountId ?? undefined}
        defaultType={editingTransaction ? undefined : newTransactionType}
        onClose={() => {
          setTransactionDialogOpen(false)
          setEditingTransaction(null)
        }}
        onSave={async (input) => saveTransaction(input)}
      />

      <ConfirmDialog
        open={Boolean(deleteTransaction)}
        title="Eliminar transacción"
        description="Esta acción no se puede deshacer."
        confirmText="Eliminar"
        onClose={() => setDeleteTransaction(null)}
        onConfirm={confirmDeleteTransaction}
      />
    </AppShell>
  )
}
