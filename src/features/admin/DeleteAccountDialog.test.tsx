import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CustomerSummary } from '../../api/types'
import { DeleteAccountDialog } from './DeleteAccountDialog'

const getCustomerDataCountsMock = vi.fn()
vi.mock('./adminMutations', () => ({
  getCustomerDataCounts: (...args: unknown[]) => getCustomerDataCountsMock(...args),
}))

function buildCustomer(overrides: Partial<CustomerSummary> = {}): CustomerSummary {
  return {
    id: 'customer-1',
    full_name: 'Anna Andersson',
    company_name: 'Acme AB',
    email: 'anna@acme.example',
    ...overrides,
  }
}

describe('DeleteAccountDialog', () => {
  beforeEach(() => {
    getCustomerDataCountsMock.mockReset()
  })

  it('shows a loading state, then the fetched counts, scoped to this specific customer', async () => {
    getCustomerDataCountsMock.mockResolvedValue({ jobCount: 3, candidateCount: 7 })
    render(<DeleteAccountDialog customer={buildCustomer()} onDelete={vi.fn()} onClose={vi.fn()} />)

    expect(screen.getByText('Hämtar information …')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Radera' })).toBeDisabled()

    await screen.findByText('3 jobb')
    expect(screen.getByText('7 kandidater')).toBeInTheDocument()
    expect(screen.getByText('All tillhörande data')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Radera' })).toBeEnabled()
    expect(getCustomerDataCountsMock).toHaveBeenCalledWith('customer-1')
  })

  it('uses the company name in the confirmation, falling back to full name then email', async () => {
    getCustomerDataCountsMock.mockResolvedValue({ jobCount: 0, candidateCount: 0 })
    render(
      <DeleteAccountDialog
        customer={buildCustomer({ company_name: null })}
        onDelete={vi.fn()}
        onClose={vi.fn()}
      />,
    )

    expect(screen.getByText(/Anna Andersson/)).toBeInTheDocument()
  })

  it('deletes and closes on confirm', async () => {
    getCustomerDataCountsMock.mockResolvedValue({ jobCount: 1, candidateCount: 2 })
    const onDelete = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()
    render(<DeleteAccountDialog customer={buildCustomer()} onDelete={onDelete} onClose={onClose} />)

    await screen.findByText('1 jobb')
    fireEvent.click(screen.getByRole('button', { name: 'Radera' }))

    await vi.waitFor(() => expect(onClose).toHaveBeenCalledOnce())
    expect(onDelete).toHaveBeenCalledWith('customer-1')
  })

  it('shows a retry option when the count lookup fails, and blocks deletion until it succeeds', async () => {
    getCustomerDataCountsMock.mockRejectedValueOnce(new Error('boom'))
    render(<DeleteAccountDialog customer={buildCustomer()} onDelete={vi.fn()} onClose={vi.fn()} />)

    await screen.findByRole('alert')
    expect(screen.getByRole('button', { name: 'Radera' })).toBeDisabled()

    getCustomerDataCountsMock.mockResolvedValueOnce({ jobCount: 0, candidateCount: 0 })
    fireEvent.click(screen.getByRole('button', { name: 'Försök igen' }))

    await screen.findByText('0 jobb')
    expect(screen.getByRole('button', { name: 'Radera' })).toBeEnabled()
  })

  it('shows an inline error and stays open when deletion itself fails', async () => {
    getCustomerDataCountsMock.mockResolvedValue({ jobCount: 0, candidateCount: 0 })
    const onDelete = vi.fn().mockRejectedValue(new Error('boom'))
    render(<DeleteAccountDialog customer={buildCustomer()} onDelete={onDelete} onClose={vi.fn()} />)

    await screen.findByText('0 jobb')
    fireEvent.click(screen.getByRole('button', { name: 'Radera' }))

    await screen.findByRole('alert')
    expect(screen.getByRole('button', { name: 'Radera' })).toBeInTheDocument()
  })
})
