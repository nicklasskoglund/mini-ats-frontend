// Route for "/" - the kanban board is the product (DESIGN.md section 2).
import { KanbanBoard } from '../features/recruitment/KanbanBoard'

export function RecruitmentPage() {
  return (
    <div>
      <h1>Rekrytering</h1>
      <KanbanBoard />
    </div>
  )
}
