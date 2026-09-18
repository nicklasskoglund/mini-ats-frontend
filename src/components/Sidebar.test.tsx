import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Sidebar } from './Sidebar'

const useAuthMock = vi.fn()
vi.mock('../auth/AuthProvider', () => ({
  useAuth: () => useAuthMock(),
}))

function renderSidebar(mobileNavOpen: boolean, onCloseMobileNav = vi.fn()) {
  return render(
    <MemoryRouter>
      <Sidebar mobileNavOpen={mobileNavOpen} onCloseMobileNav={onCloseMobileNav} />
    </MemoryRouter>,
  )
}

describe('Sidebar', () => {
  beforeEach(() => {
    useAuthMock.mockReturnValue({ role: 'customer' })
  })

  it('hides admin-only items for a customer', () => {
    renderSidebar(false)

    expect(screen.getByText('Jobb')).toBeInTheDocument()
    expect(screen.queryByText('Kunder & konton')).not.toBeInTheDocument()
  })

  it('renders no backdrop and the closed class when the mobile nav is closed', () => {
    const { container } = renderSidebar(false)

    expect(container.querySelector('.sidebar-backdrop')).not.toBeInTheDocument()
    expect(container.querySelector('.sidebar')?.className).not.toContain('sidebar--open')
  })

  it('renders a backdrop and the open class when the mobile nav is open', () => {
    const { container } = renderSidebar(true)

    expect(container.querySelector('.sidebar-backdrop')).toBeInTheDocument()
    expect(container.querySelector('.sidebar')?.className).toContain('sidebar--open')
  })

  it('closes on a backdrop click', () => {
    const onCloseMobileNav = vi.fn()
    const { container } = renderSidebar(true, onCloseMobileNav)

    fireEvent.click(container.querySelector('.sidebar-backdrop') as HTMLElement)

    expect(onCloseMobileNav).toHaveBeenCalledOnce()
  })

  it('closes on Escape only while open', () => {
    const onCloseMobileNav = vi.fn()
    renderSidebar(false, onCloseMobileNav)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onCloseMobileNav).not.toHaveBeenCalled()

    renderSidebar(true, onCloseMobileNav)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onCloseMobileNav).toHaveBeenCalledOnce()
  })

  it('closes when a nav link is picked', () => {
    const onCloseMobileNav = vi.fn()
    renderSidebar(true, onCloseMobileNav)

    fireEvent.click(screen.getByText('Jobb'))

    expect(onCloseMobileNav).toHaveBeenCalledOnce()
  })
})
