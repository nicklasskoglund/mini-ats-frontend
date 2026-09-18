import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Topbar } from './Topbar'

const useAuthMock = vi.fn()
vi.mock('../auth/AuthProvider', () => ({
  useAuth: () => useAuthMock(),
}))

vi.mock('./ActingAsDropdown', () => ({
  ActingAsDropdown: () => null,
}))

vi.mock('./UserMenu', () => ({
  UserMenu: () => null,
}))

describe('Topbar mobile menu toggle', () => {
  beforeEach(() => {
    useAuthMock.mockReturnValue({ role: 'customer' })
  })

  it('shows the closed state and calls onToggleMobileNav when clicked', () => {
    const onToggleMobileNav = vi.fn()
    render(<Topbar mobileNavOpen={false} onToggleMobileNav={onToggleMobileNav} />)

    const button = screen.getByRole('button', { name: 'Öppna meny' })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveAttribute('aria-controls', 'sidebar-nav')

    fireEvent.click(button)
    expect(onToggleMobileNav).toHaveBeenCalledOnce()
  })

  it('shows the open state label and aria-expanded when the mobile nav is open', () => {
    render(<Topbar mobileNavOpen onToggleMobileNav={vi.fn()} />)

    const button = screen.getByRole('button', { name: 'Stäng meny' })
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })
})
