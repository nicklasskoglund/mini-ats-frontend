import { describe, expect, it, vi } from 'vitest'
import type { CandidateRead } from '../../api/types'
import { buildMoveToStageItems } from './stageLabels'

describe('buildMoveToStageItems', () => {
  it('lists every stage except the current one, in board order', () => {
    const candidate: Pick<CandidateRead, 'stage'> = { stage: 'screening' }
    const items = buildMoveToStageItems(candidate, vi.fn())

    expect(items.map((item) => item.label)).toEqual([
      'Ny',
      'Intervju',
      'Erbjudande',
      'Anställd',
      'Avvisad',
    ])
  })

  it('calls onMove with the item\'s stage when clicked', () => {
    const onMove = vi.fn()
    const items = buildMoveToStageItems({ stage: 'new' }, onMove)

    const rejectedItem = items.find((item) => item.label === 'Avvisad')
    rejectedItem?.onClick()

    expect(onMove).toHaveBeenCalledWith('rejected')
  })
})
