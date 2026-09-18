import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SkeletonCards, SkeletonTableRows } from './Skeleton'

describe('SkeletonTableRows', () => {
  it('renders the requested number of rows, each spanning the given column count', () => {
    const { container } = render(
      <table>
        <tbody>
          <SkeletonTableRows rows={3} colSpan={5} />
        </tbody>
      </table>,
    )

    const rows = container.querySelectorAll('tr')
    expect(rows).toHaveLength(3)
    rows.forEach((row) => {
      const cell = row.querySelector('td')
      expect(cell).toHaveAttribute('colspan', '5')
      expect(cell?.querySelector('.skeleton-bar')).toBeInTheDocument()
    })
  })
})

describe('SkeletonCards', () => {
  it('renders the requested number of placeholder cards', () => {
    const { container } = render(<SkeletonCards count={2} />)

    expect(container.querySelectorAll('.skeleton-card')).toHaveLength(2)
  })
})
