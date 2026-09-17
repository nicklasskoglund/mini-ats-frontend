// Route for "/admin/accounts" (DESIGN.md section 12). Only the Kunder tab
// is functional in v1 - GET /admin/customers is the only read endpoint
// available (no admin-account listing yet), see the v1-avgränsning note
// in DESIGN.md section 12.
import { useState } from 'react'
import type { CustomerSummary } from '../api/types'
import { AccountTabs } from '../features/admin/AccountTabs'
import type { AccountTabKey } from '../features/admin/accountTabTypes'
import { AccountsTable } from '../features/admin/AccountsTable'
import { CreateAccountModal } from '../features/admin/CreateAccountModal'
import { DeleteAccountDialog } from '../features/admin/DeleteAccountDialog'
import { deleteAccount } from '../features/admin/adminMutations'
import { useCustomers } from '../features/admin/useCustomers'
import './AdminAccountsPage.css'

type DialogState = { type: 'none' } | { type: 'create' } | { type: 'delete'; customer: CustomerSummary }

export function AdminAccountsPage() {
  const { customers, loading, loadError, reload } = useCustomers()
  const [activeTab, setActiveTab] = useState<AccountTabKey>('customers')
  const [dialog, setDialog] = useState<DialogState>({ type: 'none' })

  const closeDialog = () => setDialog({ type: 'none' })

  return (
    <div>
      <h1>Kunder & konton</h1>
      <div className="admin-accounts-page__toolbar">
        <button
          type="button"
          className="admin-accounts-page__create"
          onClick={() => setDialog({ type: 'create' })}
        >
          + Skapa konto
        </button>
      </div>

      <AccountTabs activeTab={activeTab} onChange={setActiveTab} customerCount={customers.length} />

      {activeTab === 'customers' &&
        (loadError ? (
          <div className="admin-accounts-page__error">
            <p>Något gick fel. Försök igen.</p>
            <button type="button" onClick={reload}>
              Försök igen
            </button>
          </div>
        ) : (
          <AccountsTable
            customers={customers}
            loading={loading}
            onDelete={(customer) => setDialog({ type: 'delete', customer })}
          />
        ))}

      {activeTab === 'all' && (
        <div className="admin-accounts-page__coming-soon">
          <p>Kommer snart.</p>
          <p>Här kommer alla konton, både kunder och admins, visas tillsammans.</p>
        </div>
      )}

      {activeTab === 'admins' && (
        <div className="admin-accounts-page__coming-soon">
          <p>Kommer snart.</p>
          <p>Här kommer en lista över admin-konton visas.</p>
        </div>
      )}

      {dialog.type === 'create' && (
        <CreateAccountModal
          onCreated={() => {
            reload()
            closeDialog()
          }}
          onClose={closeDialog}
        />
      )}

      {dialog.type === 'delete' && (
        <DeleteAccountDialog
          customer={dialog.customer}
          onDelete={(accountId) => deleteAccount(accountId).then(() => reload())}
          onClose={closeDialog}
        />
      )}
    </div>
  )
}
