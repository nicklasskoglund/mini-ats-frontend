import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../api/errors'
import { CreateAccountModal } from './CreateAccountModal'

const createAccountMock = vi.fn()
const updateCustomerProfileMock = vi.fn()
vi.mock('./adminMutations', () => ({
  createAccount: (...args: unknown[]) => createAccountMock(...args),
  updateCustomerProfile: (...args: unknown[]) => updateCustomerProfileMock(...args),
}))

const showToast = vi.fn()
vi.mock('../../context/ToastProvider', () => ({
  useToast: () => ({ showToast }),
}))

function fillRequiredCustomerFields() {
  fireEvent.change(screen.getByLabelText('Namn'), { target: { value: 'Anna Andersson' } })
  fireEvent.change(screen.getByLabelText('E-post'), { target: { value: 'anna@example.com' } })
  fireEvent.change(screen.getByLabelText('Företagsnamn'), { target: { value: 'Acme AB' } })
}

describe('CreateAccountModal', () => {
  beforeEach(() => {
    createAccountMock.mockReset()
    updateCustomerProfileMock.mockReset()
    showToast.mockReset()
  })

  it('defaults to role Kund: shows Företagsnamn and the extra section, no password field', () => {
    render(<CreateAccountModal onCreated={vi.fn()} onClose={vi.fn()} />)

    expect(screen.getByLabelText('Företagsnamn')).toBeInTheDocument()
    expect(screen.getByText('Fler företagsuppgifter (valfritt)')).toBeInTheDocument()
    expect(screen.queryByLabelText('Lösenord')).not.toBeInTheDocument()
  })

  it('switching to role Admin shows Lösenord and hides the company fields', () => {
    render(<CreateAccountModal onCreated={vi.fn()} onClose={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Roll'), { target: { value: 'admin' } })

    expect(screen.getByLabelText('Lösenord')).toBeInTheDocument()
    expect(screen.queryByLabelText('Företagsnamn')).not.toBeInTheDocument()
    expect(screen.queryByText('Fler företagsuppgifter (valfritt)')).not.toBeInTheDocument()
  })

  it('creates a Kund account without a password key when no extra details are filled in', async () => {
    createAccountMock.mockResolvedValue({ id: 'account-1' })
    const onCreated = vi.fn()
    render(<CreateAccountModal onCreated={onCreated} onClose={vi.fn()} />)

    fillRequiredCustomerFields()
    fireEvent.click(screen.getByRole('button', { name: 'Skapa konto' }))

    await vi.waitFor(() => expect(onCreated).toHaveBeenCalledOnce())
    expect(createAccountMock).toHaveBeenCalledWith({
      email: 'anna@example.com',
      role: 'customer',
      full_name: 'Anna Andersson',
      company_name: 'Acme AB',
    })
    const [sentBody] = createAccountMock.mock.calls[0]
    expect(sentBody).not.toHaveProperty('password')
    expect(updateCustomerProfileMock).not.toHaveBeenCalled()
  })

  it('sends a second PATCH /profile call only when extra details were filled in', async () => {
    createAccountMock.mockResolvedValue({ id: 'account-1' })
    updateCustomerProfileMock.mockResolvedValue({ id: 'account-1' })
    const onCreated = vi.fn()
    render(<CreateAccountModal onCreated={onCreated} onClose={vi.fn()} />)

    fillRequiredCustomerFields()
    fireEvent.click(screen.getByText('Fler företagsuppgifter (valfritt)'))
    fireEvent.change(screen.getByLabelText('Webbplats'), {
      target: { value: 'https://acme.example' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Skapa konto' }))

    await vi.waitFor(() => expect(onCreated).toHaveBeenCalledOnce())
    expect(updateCustomerProfileMock).toHaveBeenCalledWith('account-1', {
      website_url: 'https://acme.example',
      linkedin_url: null,
      phone: null,
      contact_email: null,
      address: null,
      description: null,
    })
  })

  it('creates an Admin account with a password and no company_name key', async () => {
    createAccountMock.mockResolvedValue({ id: 'account-2' })
    const onCreated = vi.fn()
    render(<CreateAccountModal onCreated={onCreated} onClose={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Namn'), { target: { value: 'Admin Adminsson' } })
    fireEvent.change(screen.getByLabelText('E-post'), { target: { value: 'admin@example.com' } })
    fireEvent.change(screen.getByLabelText('Roll'), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText('Lösenord'), { target: { value: 'supersecret' } })
    fireEvent.click(screen.getByRole('button', { name: 'Skapa konto' }))

    await vi.waitFor(() => expect(onCreated).toHaveBeenCalledOnce())
    expect(createAccountMock).toHaveBeenCalledWith({
      email: 'admin@example.com',
      role: 'admin',
      full_name: 'Admin Adminsson',
      password: 'supersecret',
    })
    const [sentBody] = createAccountMock.mock.calls[0]
    expect(sentBody).not.toHaveProperty('company_name')
  })

  it('shows an inline error and does not call onCreated when creation fails', async () => {
    createAccountMock.mockRejectedValue(new Error('boom'))
    const onCreated = vi.fn()
    render(<CreateAccountModal onCreated={onCreated} onClose={vi.fn()} />)

    fillRequiredCustomerFields()
    fireEvent.click(screen.getByRole('button', { name: 'Skapa konto' }))

    await screen.findByRole('alert')
    expect(screen.getByRole('alert')).toHaveTextContent('Något gick fel. Försök igen.')
    expect(onCreated).not.toHaveBeenCalled()
  })

  it('shows the specific, translated message for a duplicate-email 409 instead of the generic copy', async () => {
    createAccountMock.mockRejectedValue(
      new ApiError(409, 'An account with this email already exists'),
    )
    const onCreated = vi.fn()
    render(<CreateAccountModal onCreated={onCreated} onClose={vi.fn()} />)

    fillRequiredCustomerFields()
    fireEvent.click(screen.getByRole('button', { name: 'Skapa konto' }))

    await screen.findByRole('alert')
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Ett konto med den här e-postadressen finns redan.',
    )
    expect(onCreated).not.toHaveBeenCalled()
  })

  it('still succeeds (and shows a toast) when the account is created but the profile update fails', async () => {
    createAccountMock.mockResolvedValue({ id: 'account-1' })
    updateCustomerProfileMock.mockRejectedValue(new Error('boom'))
    const onCreated = vi.fn()
    render(<CreateAccountModal onCreated={onCreated} onClose={vi.fn()} />)

    fillRequiredCustomerFields()
    fireEvent.click(screen.getByText('Fler företagsuppgifter (valfritt)'))
    fireEvent.change(screen.getByLabelText('Webbplats'), {
      target: { value: 'https://acme.example' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Skapa konto' }))

    await vi.waitFor(() => expect(onCreated).toHaveBeenCalledOnce())
    expect(showToast).toHaveBeenCalledWith(
      'Kontot skapades, men de extra företagsuppgifterna kunde inte sparas. Försök igen från kundens inställningar.',
    )
  })
})
