import { describe, expect, it } from 'vitest'
import { ApiError } from '../../api/errors'
import { getAccountCreationErrorMessage } from './accountCreationErrorMessage'

describe('getAccountCreationErrorMessage', () => {
  it('translates the duplicate-email 409', () => {
    const error = new ApiError(409, 'An account with this email already exists')
    expect(getAccountCreationErrorMessage(error)).toBe(
      'Ett konto med den här e-postadressen finns redan.',
    )
  })

  it('translates the missing-company_name 400', () => {
    const error = new ApiError(400, "company_name is required when role is 'customer'")
    expect(getAccountCreationErrorMessage(error)).toBe('Företagsnamn krävs för kundkonton.')
  })

  it('translates the password-not-allowed-for-customer 400', () => {
    const error = new ApiError(
      400,
      "password must not be set when role is 'customer' - the customer sets their own via the invite email",
    )
    expect(getAccountCreationErrorMessage(error)).toBe(
      'Lösenord kan inte anges för kundkonton — kunden väljer sitt eget via inbjudningsmejlet.',
    )
  })

  it('translates the missing-password-for-admin 400', () => {
    const error = new ApiError(400, "password is required when role is 'admin'")
    expect(getAccountCreationErrorMessage(error)).toBe('Lösenord krävs för admin-konton.')
  })

  it('falls back to the generic copy for the dynamic 502 Supabase message', () => {
    const error = new ApiError(502, 'Account creation failed: Email address "x" is invalid')
    expect(getAccountCreationErrorMessage(error)).toBe('Något gick fel. Försök igen.')
  })

  it('falls back to the generic copy for an unrecognized detail string', () => {
    const error = new ApiError(400, 'Some future backend text we have never seen')
    expect(getAccountCreationErrorMessage(error)).toBe('Något gick fel. Försök igen.')
  })

  it('falls back to the generic copy for a network failure', () => {
    expect(getAccountCreationErrorMessage(new ApiError(0, null))).toBe(
      'Något gick fel. Försök igen.',
    )
  })

  it('falls back to the generic copy for a non-ApiError', () => {
    expect(getAccountCreationErrorMessage(new Error('boom'))).toBe('Något gick fel. Försök igen.')
  })
})
