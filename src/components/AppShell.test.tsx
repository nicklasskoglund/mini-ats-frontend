import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AppShell } from './AppShell'

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

describe('AppShell mobile nav wiring', () => {
  it('opens the sidebar when the hamburger button is clicked, and closes it again', () => {
    useAuthMock.mockReturnValue({ role: 'customer' })
    const { container } = render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<p>Page content</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    const toggle = screen.getByRole('button', { name: 'Öppna meny' })
    expect(container.querySelector('.sidebar')?.className).not.toContain('sidebar--open')

    fireEvent.click(toggle)
    expect(screen.getByRole('button', { name: 'Stäng meny' })).toBeInTheDocument()
    expect(container.querySelector('.sidebar')?.className).toContain('sidebar--open')

    fireEvent.click(screen.getByRole('button', { name: 'Stäng meny' }))
    expect(container.querySelector('.sidebar')?.className).not.toContain('sidebar--open')
  })
})
