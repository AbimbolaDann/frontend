import { describe, it, expect } from 'vitest'
import { validateDobFormat, formatDobForDisplay, validateAddress, hasMaliciousContent, type AddressValues } from './kycValidation'

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
      expect(validateDobFormat(value)).toMatchObject({ valid: false, error: 'Use MM/DD/YYYY, MM-DD-YYYY or YYYY-MM-DD' })
    }
  })

  it('rejects invalid calendar dates', () => {
    const invalidDates = [ '02/30/2020', '04/31/2020', '02/29/2019' ]
    for (const value of invalidDates) {
      const result = validateDobFormat(value)
      expect(result.valid).toBe(false)
      expect(result.error).toContain(`Invalid calendar date: ${value}`)
    }
  })

  it('accepts valid dates', () => {
    expect(validateDobFormat('01/15/2000')).toEqual({ valid: true })
    expect(validateDobFormat('01-15-2000')).toEqual({ valid: true })
    expect(validateDobFormat('2000-01-15')).toEqual({ valid: true })
  })
})

describe('formatDobForDisplay', () => {
  it('formats valid dates', () => {
    expect(formatDobForDisplay('2000-01-15')).toBe('01/15/2000')
    expect(formatDobForDisplay('01-15-2000')).toBe('01/15/2000')
  })

  it('escapes malicious input', () => {
    expect(formatDobForDisplay('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(formatDobForDisplay("'; DROP TABLE users;--")).toBe("&#39;; DROP TABLE users;--")
  })
})

describe('hasMaliciousContent', () => {
  it('detects common XSS payloads', () => {
    expect(hasMaliciousContent('<script>alert(1)</script>')).toBe(true)
    expect(hasMaliciousContent('javascript:alert(1)')).toBe(true)
    expect(hasMaliciousContent('"><img src=x onerror=alert(1)>')).toBe(true)
  })

  it('detects SQL injection patterns', () => {
    expect(hasMaliciousContent("'; DROP TABLE users;--")).toBe(true)
    expect(hasMaliciousContent("1 UNION SELECT * FROM users")).toBe(true)
  })

  it('returns false for benign input', () => {
    expect(hasMaliciousContent('123 Main St')).toBe(false)
    expect(hasMaliciousContent('John Doe')).toBe(false)
  })
})

describe('validateAddress', () => {
  const validAddress: AddressValues = {
    street: '123 Main St',
    city: 'Springfield',
    state: 'IL',
    zip: '62701',
    country: 'US',
  }

  it('returns no errors for valid address', () => {
    const errors = validateAddress(validAddress)
    expect(errors).toEqual({})
  })

  it('returns required errors for missing fields', () => {
    const errors = validateAddress({ street: '', city: '', state: '', zip: '', country: '' })
    expect(errors).toEqual({
      street: 'Street address is required',
      city: 'City is required',
      state: 'State is required',
      zip: 'ZIP code is required',
      country: 'Country is required',
    })
  })

  it('rejects XSS payloads in address fields', () => {
    const xss = '<script>alert(1)</script>'
    const errors = validateAddress({ ...validAddress, street: xss })
    expect(errors.street).toBe('Street address contains invalid characters')
  })

  it('rejects SQL injection payloads in city', () => {
    const errors = validateAddress({ ...validAddress, city: "'; DROP TABLE users;--" })
    expect(errors.city).toBe('City contains invalid characters')
  })

  it('rejects malicious content in any field', () => {
    const malicious = {
      street: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zip: '<script>alert(1)</script>',
      country: 'US',
    }
    const errors = validateAddress(malicious)
    expect(errors.zip).toBe('ZIP code contains invalid characters')
  })

  it('rejects malicious content in optional apartment field', () => {
    const errors = validateAddress({ ...validAddress, apartment: '<img src=x onerror=alert(1)>' })
    expect(errors.apartment).toBe('Apartment contains invalid characters')
  })
})
