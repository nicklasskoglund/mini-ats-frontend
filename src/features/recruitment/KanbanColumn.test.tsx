import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { KanbanColumn } from './KanbanColumn'

describe('KanbanColumn drag-over highlight', () => {
  it('stays highlighted while the drag moves over a child element instead of flickering off', () => {
    // Regression test: dragenter/dragleave fire for every child the
    // pointer crosses. Moving from the column background onto a card
    // inside it fires enter (bubbling from the card) before leave (from
    // the column background) - a depth counter should stay above zero
    // through that transition instead of the highlight flickering off.
    const { container } = render(
      <KanbanColumn
        stage="new"
        candidates={[]}
        jobTitleById={new Map()}
        showJobTitle={false}
        loading={false}
        onMove={vi.fn()}
      />,
    )
    const column = container.querySelector('.kanban-column') as HTMLElement

    fireEvent.dragEnter(column)
    expect(column.className).toContain('kanban-column--drag-over')

    // Simulates crossing onto a nested card: enter before the resulting leave.
    fireEvent.dragEnter(column)
    fireEvent.dragLeave(column)
    expect(column.className).toContain('kanban-column--drag-over')

    fireEvent.dragLeave(column)
    expect(column.className).not.toContain('kanban-column--drag-over')
  })

  it('clears the highlight on drop', () => {
    const { container } = render(
      <KanbanColumn
        stage="new"
        candidates={[]}
        jobTitleById={new Map()}
        showJobTitle={false}
        loading={false}
        onMove={vi.fn()}
      />,
    )
    const column = container.querySelector('.kanban-column') as HTMLElement

    fireEvent.dragEnter(column)
    fireEvent.drop(column, { dataTransfer: { getData: () => '' } })

    expect(column.className).not.toContain('kanban-column--drag-over')
  })
})
