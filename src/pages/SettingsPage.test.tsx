import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ProfileRead } from '../api/types'
import { ToastProvider } from '../context/ToastProvider'
import { SettingsPage } from './SettingsPage'

const useProfileMock = vi.fn()
vi.mock('../features/settings/useProfile', () => ({
  useProfile: () => useProfileMock(),
}))

function renderPage() {
  return render(
    <ToastProvider>
      <SettingsPage />
    </ToastProvider>,
  )
}

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

describe('SettingsPage', () => {
  beforeEach(() => {
    useProfileMock.mockReset()
  })

  it('shows the placeholder and makes no API call when disabled', () => {
    useProfileMock.mockReturnValue({
      profile: null,
      loading: false,
      loadError: false,
      enabled: false,
      reload: vi.fn(),
      updateProfile: vi.fn(),
    })

    renderPage()

    expect(screen.getByText('Välj en kund för att se profilen.')).toBeInTheDocument()
  })

  it('renders the profile form once the profile has loaded', () => {
    useProfileMock.mockReturnValue({
      profile: buildProfile(),
      loading: false,
      loadError: false,
      enabled: true,
      reload: vi.fn(),
      updateProfile: vi.fn(),
    })

    renderPage()

    expect(screen.getByLabelText('Företagsnamn')).toHaveValue('Acme AB')
  })

  it('shows a retry option when the profile failed to load', () => {
    const reload = vi.fn()
    useProfileMock.mockReturnValue({
      profile: null,
      loading: false,
      loadError: true,
      enabled: true,
      reload,
      updateProfile: vi.fn(),
    })

    renderPage()

    expect(screen.getByText('Något gick fel. Försök igen.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Försök igen' }))
    expect(reload).toHaveBeenCalledOnce()
  })
})
