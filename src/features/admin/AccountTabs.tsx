// Alla/Kunder/Admins tab bar (DESIGN.md section 12). Only Kunder has a
// working data source (GET /admin/customers) - Alla and Admins show no
// count at all, not even 0, since there's no read endpoint for them yet.
import type { AccountTabKey } from './accountTabTypes'
import './AccountTabs.css'

interface AccountTabsProps {
  activeTab: AccountTabKey
  onChange: (tab: AccountTabKey) => void
  customerCount: number
}

const TAB_LABELS: { key: AccountTabKey; label: string }[] = [
  { key: 'all', label: 'Alla' },
  { key: 'customers', label: 'Kunder' },
  { key: 'admins', label: 'Admins' },
]

export function AccountTabs({ activeTab, onChange, customerCount }: AccountTabsProps) {
  return (
    <div className="account-tabs" role="tablist">
      {TAB_LABELS.map((tab) => {
        const label = tab.key === 'customers' ? `${tab.label} (${customerCount})` : tab.label
        const isActive = activeTab === tab.key
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={isActive ? 'account-tabs__tab account-tabs__tab--active' : 'account-tabs__tab'}
            onClick={() => onChange(tab.key)}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
