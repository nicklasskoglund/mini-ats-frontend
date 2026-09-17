import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { CustomerSummary } from '../../api/types'
import { AccountsTable } from './AccountsTable'

function buildCustomer(overrides: Partial<CustomerSummary> = {}): CustomerSummary {
  return {
    id: 'customer-1',
    full_name: 'Anna Andersson',
    company_name: 'Acme AB',
    email: 'anna@acme.example',
    ...overrides,
  }
}

describe('AccountsTable', () => {
  it('shows skeleton rows while loading', () => {
    const { container } = render(<AccountsTable customers={[]} loading onDelete={vi.fn()} />)

    expect(container.querySelectorAll('.accounts-table__skeleton-bar')).toHaveLength(3)
  })

  it('shows an empty-state message when there are no customers', () => {
    render(<AccountsTable customers={[]} loading={false} onDelete={vi.fn()} />)

    expect(
      screen.getByText('Inga kundkonton ännu. Skapa det första kontot för att komma igång.'),
    ).toBeInTheDocument()
  })

  it('renders each customer with a fixed "Kund" role label', () => {
    render(<AccountsTable customers={[buildCustomer()]} loading={false} onDelete={vi.fn()} />)

    expect(screen.getByText('Anna Andersson')).toBeInTheDocument()
    expect(screen.getByText('Acme AB')).toBeInTheDocument()
    expect(screen.getByText('Kund')).toBeInTheDocument()
    expect(screen.getByText('anna@acme.example')).toBeInTheDocument()
  })

  it('falls back to an en dash for missing optional fields', () => {
    render(
      <AccountsTable
        customers={[buildCustomer({ full_name: null, company_name: null, email: null })]}
        loading={false}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getAllByText('–')).toHaveLength(3)
  })

  it('calls onDelete via the kebab menu, with no Redigera option', () => {
    const onDelete = vi.fn()
    const customer = buildCustomer()
    render(<AccountsTable customers={[customer]} loading={false} onDelete={onDelete} />)

    fireEvent.click(screen.getByRole('button', { name: 'Fler alternativ' }))
    expect(screen.queryByRole('menuitem', { name: 'Redigera' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('menuitem', { name: 'Radera' }))

    expect(onDelete).toHaveBeenCalledWith(customer)
  })
})
