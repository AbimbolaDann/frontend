import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AddressVerificationForm } from './AddressVerificationForm'

describe('AddressVerificationForm', () => {
  it('submits XSS payload and does not crash', () => {
    const onSubmit = vi{}()
    render(<AddressVerificationForm onSubmit={onSubmit} />)
    fireEvent.change(screen.getByLabelText('Street address *'), { target: { value: '<script>alert(1)</script>' } })
    fireEvent.change(screen.getByLabelText('City *'), { target: { value: 'x' } })
    fireEvent.change(screen.getByLabelText('State / Province *'), { target: { value: 'y' } })
    fireEvent.change(screen.getByLabelText('ZIP / Postal code *'), { target: { value: 'z' } })
    fireEvent.change(screen.getByLabelText('Country *'), { target: { value: 'US' } })
    fireEvent.click(screen.getByText('Verify address'))
    expect(onSubmit).toHaveBeenCalled()
  })
})