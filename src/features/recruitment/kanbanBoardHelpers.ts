// Pure board-state update used for the optimistic move (see
// useKanbanBoard.ts): moves one candidate from its current stage's array
// into the target stage's array, updating its `stage` field to match.
import type { CandidateRead, KanbanBoard, Stage } from '../../api/types'

export function moveCandidateInBoard(
  board: KanbanBoard,
  candidate: CandidateRead,
  targetStage: Stage,
): KanbanBoard {
  const movedCandidate: CandidateRead = { ...candidate, stage: targetStage }

  return {
    ...board,
    [candidate.stage]: board[candidate.stage].filter((c) => c.id !== candidate.id),
    [targetStage]: [...board[targetStage], movedCandidate],
  }
}
