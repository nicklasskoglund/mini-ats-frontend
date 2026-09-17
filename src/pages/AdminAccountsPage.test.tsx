import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CustomerSummary } from '../api/types'
import { ToastProvider } from '../context/ToastProvider'
import { AdminAccountsPage } from './AdminAccountsPage'

function renderPage() {
  return render(
    <ToastProvider>
      <AdminAccountsPage />
    </ToastProvider>,
  )
}

const useCustomersMock = vi.fn()
vi.mock('../features/admin/useCustomers', () => ({
  useCustomers: () => useCustomersMock(),
}))

const createAccountMock = vi.fn()
const deleteAccountMock = vi.fn()
const updateCustomerProfileMock = vi.fn()
const getCustomerDataCountsMock = vi.fn()
vi.mock('../features/admin/adminMutations', () => ({
  createAccount: (...args: unknown[]) => createAccountMock(...args),
  deleteAccount: (...args: unknown[]) => deleteAccountMock(...args),
  updateCustomerProfile: (...args: unknown[]) => updateCustomerProfileMock(...args),
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

function setUpCustomers(overrides: Partial<ReturnType<typeof defaultCustomers>> = {}) {
  useCustomersMock.mockReturnValue({ ...defaultCustomers(), ...overrides })
}

function defaultCustomers() {
  return {
    customers: [buildCustomer()],
    loading: false,
    loadError: false,
    reload: vi.fn(),
  }
}

describe('AdminAccountsPage', () => {
  beforeEach(() => {
    createAccountMock.mockReset()
    deleteAccountMock.mockReset().mockResolvedValue(undefined)
    updateCustomerProfileMock.mockReset()
    getCustomerDataCountsMock.mockReset().mockResolvedValue({ jobCount: 0, candidateCount: 0 })
  })

  it('defaults to the Kunder tab with a real count, and no count on Alla/Admins', () => {
    setUpCustomers()

    renderPage()

    expect(screen.getByRole('tab', { name: 'Kunder (1)' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Anna Andersson')).toBeInTheDocument()
  })

  it('shows a "Kommer snart" placeholder for Alla and Admins', () => {
    setUpCustomers()

    renderPage()

    fireEvent.click(screen.getByRole('tab', { name: 'Alla' }))
    expect(screen.getAllByText('Kommer snart.')).toHaveLength(1)
    expect(screen.queryByText('Anna Andersson')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'Admins' }))
    expect(screen.getAllByText('Kommer snart.')).toHaveLength(1)
  })

  it('opens the create account modal', () => {
    setUpCustomers()

    renderPage()
    fireEvent.click(screen.getByRole('button', { name: '+ Skapa konto' }))

    expect(screen.getByRole('heading', { name: 'Skapa konto' })).toBeInTheDocument()
  })

  it('reloads and closes the modal after a successful account creation', async () => {
    const reload = vi.fn()
    setUpCustomers({ reload })
    createAccountMock.mockResolvedValue({ id: 'account-2' })

    renderPage()
    fireEvent.click(screen.getByRole('button', { name: '+ Skapa konto' }))
    fireEvent.change(screen.getByLabelText('Namn'), { target: { value: 'Ny Kund' } })
    fireEvent.change(screen.getByLabelText('E-post'), { target: { value: 'ny@example.com' } })
    fireEvent.change(screen.getByLabelText('Företagsnamn'), { target: { value: 'Ny AB' } })
    fireEvent.click(screen.getByRole('button', { name: 'Skapa konto' }))

    await vi.waitFor(() => expect(reload).toHaveBeenCalledOnce())
    expect(screen.queryByText('Skapa konto')).not.toBeInTheDocument()
  })

  it('opens the delete dialog for the clicked customer', () => {
    setUpCustomers()

    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Fler alternativ' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Radera' }))

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('Radera kundkonto')).toBeInTheDocument()
    expect(within(dialog).getByText(/Acme AB/)).toBeInTheDocument()
  })

  it('shows a retry option when the customer list failed to load', () => {
    const reload = vi.fn()
    setUpCustomers({ loadError: true, reload })

    renderPage()

    expect(screen.getByText('Något gick fel. Försök igen.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Försök igen' }))
    expect(reload).toHaveBeenCalledOnce()
  })
})
