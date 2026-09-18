// Kunder tab table (DESIGN.md section 12): Namn/Företag/Roll/E-post plus a
// kebab menu with just Radera - there's no PATCH endpoint for editing an
// account's own fields, only the customer's separate profile (Settings).
// CustomerSummary has no role field (v1-avgränsning), so "Kund" is a fixed
// label, not read from the response.
import { KebabMenu } from '../../components/KebabMenu'
import { SkeletonTableRows } from '../../components/Skeleton'
import type { CustomerSummary } from '../../api/types'
import './AccountsTable.css'

interface AccountsTableProps {
  customers: CustomerSummary[]
  loading: boolean
  onDelete: (customer: CustomerSummary) => void
}

export function AccountsTable({ customers, loading, onDelete }: AccountsTableProps) {
  return (
    <div className="accounts-table-container">
      <table className="accounts-table">
        <thead>
          <tr>
            <th>Namn</th>
            <th>Företag</th>
            <th>Roll</th>
            <th>E-post</th>
            <th aria-label="Åtgärder" />
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <SkeletonTableRows rows={3} colSpan={5} />
          ) : customers.length === 0 ? (
            <tr>
              <td colSpan={5} className="accounts-table__empty">
                Inga kundkonton ännu. Skapa det första kontot för att komma igång.
              </td>
            </tr>
          ) : (
            customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.full_name ?? '–'}</td>
                <td>{customer.company_name ?? '–'}</td>
                <td>Kund</td>
                <td>{customer.email ?? '–'}</td>
                <td className="accounts-table__actions">
                  <KebabMenu items={[{ label: 'Radera', onClick: () => onDelete(customer) }]} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
