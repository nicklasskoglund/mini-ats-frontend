import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { KanbanBoard } from './KanbanBoard'

const useKanbanBoardMock = vi.fn()
vi.mock('./useKanbanBoard', () => ({
  useKanbanBoard: () => useKanbanBoardMock(),
}))

function buildBoard() {
  return { new: [], screening: [], interview: [], offer: [], hired: [], rejected: [] }
}

function defaultReturn() {
  return {
    board: buildBoard(),
    jobs: [],
    jobTitleById: new Map(),
    loading: false,
    loadError: false,
    jobFilter: null,
    setJobFilter: vi.fn(),
    nameFilter: '',
    setNameFilter: vi.fn(),
    moveCandidate: vi.fn(),
    reload: vi.fn(),
  }
}

describe('KanbanBoard mobile tabs', () => {
  beforeEach(() => {
    useKanbanBoardMock.mockReturnValue(defaultReturn())
  })

  it('defaults to the first stage as the active mobile column', () => {
    const { container } = render(<KanbanBoard />)

    const columns = container.querySelectorAll('.kanban-board__column')
    expect(columns[0].className).toContain('kanban-board__column--active')
    expect(columns[1].className).not.toContain('kanban-board__column--active')
  })

  it('switches the active column when a mobile tab is picked', () => {
    const { container } = render(<KanbanBoard />)

    fireEvent.click(screen.getByRole('tab', { name: 'Intervju (0)' }))

    const columns = container.querySelectorAll('.kanban-board__column')
    expect(columns[0].className).not.toContain('kanban-board__column--active')
    expect(columns[2].className).toContain('kanban-board__column--active')
  })
})
