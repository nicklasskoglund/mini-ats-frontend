// Shared date formatting for the app's "Skapad"/"Senast uppdaterad" columns.
export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('sv-SE')
}
