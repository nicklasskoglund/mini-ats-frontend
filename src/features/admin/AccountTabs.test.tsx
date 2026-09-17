import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AccountTabs } from './AccountTabs'

describe('AccountTabs', () => {
  it('shows a count only on Kunder, never on Alla or Admins', () => {
    render(<AccountTabs activeTab="customers" onChange={vi.fn()} customerCount={3} />)

    expect(screen.getByRole('tab', { name: 'Kunder (3)' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Alla' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Admins' })).toBeInTheDocument()
  })

  it('marks the active tab via aria-selected', () => {
    render(<AccountTabs activeTab="all" onChange={vi.fn()} customerCount={0} />)

    expect(screen.getByRole('tab', { name: 'Alla' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Kunder (0)' })).toHaveAttribute('aria-selected', 'false')
  })

  it('calls onChange with the clicked tab key', () => {
    const onChange = vi.fn()
    render(<AccountTabs activeTab="customers" onChange={onChange} customerCount={1} />)

    fireEvent.click(screen.getByRole('tab', { name: 'Admins' }))

    expect(onChange).toHaveBeenCalledWith('admins')
  })
})
