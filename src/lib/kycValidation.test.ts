import { describe, it, expect } from 'vitest'
import { validateDobFormat, formatDobForDisplay, validateAddress, type AddressValues } from './kycValidation'

describe('validateDobFormat', () => {
  it('returns required error for empty string', () => {
    expect(validateDobFormat('')).toEqual({ valid: false, error: 'Date of birth is required' })
  })

  it('returns required error for whitespace-only string', () => {
    expect(validateDobFormat('   ')).toEqual({ valid: false, error: 'Date of birth is required' })
  })

  it('rejects invalid formats and malicious input', () => {
    const invalidFormats = [
      '01/01/200',
      '01-01-200',
      '1/1/2000',
      '<script>alert(1)</script>',
      "'; DROP TABLE users;--",
    ]
    for (const value of invalidFormats) {
      expect(validateDobFormat(value)).matchObject({ valid: false, error: 'Use MM/DD/YYYY, MM-DD-YYYY or YYYY-MM-DD' })
    }
  })

  it('rejects invalid calendar dates', () => {
    const invalidDates = [ '02/30/2020', '04/31/2020', '02/29/2019' ]
    for (const value of invalidDates) {
      const result = validateDobFormat(value)
      expect(result.valid).toBeFalse()
      expect(result.error).toContain(`Invalid calendar date: ${value}`)
    }
  })

  it('accepts valid dates', () => {
    expect(validateDobFormat('01/15/2000')).toEqual({ valid: true })
    expect(validateDobFormat('01-15-2000')).toEqual({ valid: true })
    expect(validateDobFormat('2000-01-15')).toEqual({ valid: true })
  })
})