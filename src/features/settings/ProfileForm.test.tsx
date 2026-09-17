import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ProfileRead } from '../../api/types'
import { ToastProvider } from '../../context/ToastProvider'
import { ProfileForm } from './ProfileForm'

function buildProfile(overrides: Partial<ProfileRead> = {}): ProfileRead {
  return {
    id: 'customer-1',
    role: 'customer',
    full_name: 'Anna Andersson',
    company_name: 'Acme AB',
    website_url: null,
    linkedin_url: null,
    phone: null,
    contact_email: null,
    address: null,
    description: null,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function renderForm(props: Partial<Parameters<typeof ProfileForm>[0]> = {}) {
  const onSave = props.onSave ?? vi.fn().mockResolvedValue(undefined)
  render(
    <ToastProvider>
      <ProfileForm profile={props.profile ?? buildProfile()} onSave={onSave} />
    </ToastProvider>,
  )
  return { onSave }
}

describe('ProfileForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('prefills fields from the given profile', () => {
    renderForm({ profile: buildProfile({ phone: '070-000 00 00' }) })

    expect(screen.getByLabelText('Namn')).toHaveValue('Anna Andersson')
    expect(screen.getByLabelText('Företagsnamn')).toHaveValue('Acme AB')
    expect(screen.getByLabelText('Telefon')).toHaveValue('070-000 00 00')
  })

  it('submits edited values as a partial ProfileUpdate, nulling cleared fields', async () => {
    const { onSave } = renderForm()

    fireEvent.change(screen.getByLabelText('Företagsnamn'), { target: { value: 'Nytt namn AB' } })
    fireEvent.change(screen.getByLabelText('Telefon'), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: 'Spara' }))

    await vi.waitFor(() => expect(onSave).toHaveBeenCalledOnce())
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ company_name: 'Nytt namn AB', phone: null }),
    )
  })

  it('shows an inline error when saving fails', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('boom'))
    renderForm({ onSave })

    fireEvent.click(screen.getByRole('button', { name: 'Spara' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Något gick fel. Försök igen.')
  })
})
