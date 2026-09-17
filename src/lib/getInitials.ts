// Shared avatar-initials logic. Originally private to UserMenu.tsx (Step
// 2); extracted once the candidate profile header (Step 5) needed the
// same derivation for a candidate's name.
export function getInitials(name: string | null): string {
  if (!name) {
    return '?'
  }
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
