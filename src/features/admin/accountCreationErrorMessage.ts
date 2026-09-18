// Translates POST /admin/accounts' fixed-text HTTPException details (see
// app/routers/admin.py, read but never changed - backend is frozen) into
// Swedish, since the backend is English-only. These four strings are
// exhaustive for this endpoint's hand-written errors - the 502 case
// appends Supabase's own dynamic message and can't be translated in
// advance, so it (and anything unrecognized) falls back to the generic
// error copy instead of showing raw English to the admin.
import { ApiError, getGenericErrorMessage } from '../../api/errors'

const KNOWN_DETAIL_TRANSLATIONS: Record<string, string> = {
  "company_name is required when role is 'customer'": 'Företagsnamn krävs för kundkonton.',
  "password must not be set when role is 'customer' - the customer sets their own via the invite email":
    'Lösenord kan inte anges för kundkonton — kunden väljer sitt eget via inbjudningsmejlet.',
  "password is required when role is 'admin'": 'Lösenord krävs för admin-konton.',
  'An account with this email already exists': 'Ett konto med den här e-postadressen finns redan.',
}

export function getAccountCreationErrorMessage(error: unknown): string {
  if (error instanceof ApiError && typeof error.detail === 'string') {
    const translated = KNOWN_DETAIL_TRANSLATIONS[error.detail]
    if (translated) {
      return translated
    }
  }
  return getGenericErrorMessage(error)
}
