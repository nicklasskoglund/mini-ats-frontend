// Admin-only "act as a customer" picker (DESIGN.md section 6). Selecting a
// customer here is what makes the API client start sending
// X-Acting-As-Customer on every request.
import { useActingAs } from '../context/ActingAsProvider'
import './ActingAsDropdown.css'

export function ActingAsDropdown() {
  const { customerId, customers, loading, setActingAsCustomer } = useActingAs()

  return (
    <label className="acting-as-dropdown">
      <span className="acting-as-dropdown__label">Agera som kund</span>
      <select
        value={customerId ?? ''}
        onChange={(event) => setActingAsCustomer(event.target.value || null)}
        disabled={loading}
      >
        <option value="">Ingen vald</option>
        {customers.map((customer) => (
          <option key={customer.id} value={customer.id}>
            {customer.company_name ?? customer.email ?? customer.id}
          </option>
        ))}
      </select>
    </label>
  )
}
