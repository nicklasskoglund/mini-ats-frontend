// Shared loading placeholders (DESIGN.md section 13): one variant for
// table rows, one for kanban cards, so every list builds its skeleton
// state the same way instead of each duplicating near-identical markup.
import './Skeleton.css'

interface SkeletonTableRowsProps {
  /** Number of placeholder rows to render. */
  rows: number
  /** Must match the table's real column count for the placeholder <td> to span correctly. */
  colSpan: number
}

export function SkeletonTableRows({ rows, colSpan }: SkeletonTableRowsProps) {
  return (
    <>
      {Array.from({ length: rows }, (_, index) => (
        <tr key={index}>
          <td colSpan={colSpan}>
            <div className="skeleton-bar" />
          </td>
        </tr>
      ))}
    </>
  )
}

interface SkeletonCardsProps {
  /** Number of placeholder cards to render. */
  count: number
}

export function SkeletonCards({ count }: SkeletonCardsProps) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="skeleton-card" />
      ))}
    </>
  )
}
