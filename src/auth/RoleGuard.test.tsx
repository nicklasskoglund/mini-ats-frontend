import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { RoleGuard } from './RoleGuard'
import { useAuth } from './AuthProvider'

vi.mock('./AuthProvider', () => ({
  useAuth: vi.fn(),
}))

const mockedUseAuth = vi.mocked(useAuth)

describe('RoleGuard', () => {
  it('renders children when the role is allowed', () => {
    mockedUseAuth.mockReturnValue({
      role: 'admin',
      session: null,
      fullName: null,
      loading: false,
      signOut: vi.fn(),
    })

    render(
      <RoleGuard allow={['admin']}>
        <p>Hemligt admin-innehåll</p>
      </RoleGuard>,
    )

    expect(screen.getByText('Hemligt admin-innehåll')).toBeInTheDocument()
  })

  it('shows the access-denied message when the role is not allowed', () => {
    mockedUseAuth.mockReturnValue({
      role: 'customer',
      session: null,
      fullName: null,
      loading: false,
      signOut: vi.fn(),
    })

    render(
      <RoleGuard allow={['admin']}>
        <p>Hemligt admin-innehåll</p>
      </RoleGuard>,
    )

    expect(screen.queryByText('Hemligt admin-innehåll')).not.toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Du har inte behörighet till den här resursen.',
    )
  })

  it('shows the access-denied message when there is no role at all', () => {
    mockedUseAuth.mockReturnValue({
      role: null,
      session: null,
      fullName: null,
      loading: false,
      signOut: vi.fn(),
    })

    render(
      <RoleGuard allow={['admin', 'customer']}>
        <p>Hemligt innehåll</p>
      </RoleGuard>,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
