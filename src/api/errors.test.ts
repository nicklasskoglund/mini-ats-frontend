import { describe, expect, it } from 'vitest'
import {
  ApiError,
  getGenericErrorMessage,
  isActingAsCustomerNotFound,
  isValidationDetail,
} from './errors'

describe('isValidationDetail', () => {
  it('is true for an array detail (Pydantic 422)', () => {
    expect(isValidationDetail([{ loc: ['body'], msg: 'x', type: 'missing' }])).toBe(true)
  })

  it('is false for a string detail (HTTPException, or a constraint-violation 422)', () => {
    expect(isValidationDetail('Something went wrong')).toBe(false)
  })

  it('is false for a missing detail', () => {
    expect(isValidationDetail(null)).toBe(false)
  })
})

describe('isActingAsCustomerNotFound', () => {
  it('matches the exact 404 case', () => {
    const error = new ApiError(404, 'No customer found for X-Acting-As-Customer')
    expect(isActingAsCustomerNotFound(error)).toBe(true)
  })

  it('does not match a different 404 detail', () => {
    const error = new ApiError(404, 'Candidate not found')
    expect(isActingAsCustomerNotFound(error)).toBe(false)
  })

  it('does not match the same detail on a different status', () => {
    const error = new ApiError(400, 'No customer found for X-Acting-As-Customer')
    expect(isActingAsCustomerNotFound(error)).toBe(false)
  })

  it('is false for a non-ApiError', () => {
    expect(isActingAsCustomerNotFound(new Error('boom'))).toBe(false)
  })
})

describe('getGenericErrorMessage', () => {
  it('returns the access-denied copy for a 403', () => {
    expect(getGenericErrorMessage(new ApiError(403, 'Forbidden'))).toBe(
      'Du har inte behörighet till den här resursen.',
    )
  })

  it('falls back to the generic copy for anything else', () => {
    expect(getGenericErrorMessage(new ApiError(500, 'boom'))).toBe('Något gick fel. Försök igen.')
    expect(getGenericErrorMessage(new ApiError(0, null))).toBe('Något gick fel. Försök igen.')
    expect(getGenericErrorMessage(new Error('unrelated'))).toBe('Något gick fel. Försök igen.')
  })
})
