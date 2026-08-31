import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AddressVerificationForm } from './AddressVerificationForm'

describe('AddressVerificationForm', () => {
  it('does not submit when address contains XSS payload', () => {
    const onSubmit = vi.fn()
    render(<AddressVerificationForm onSubmit={onSubmit} />)
    fireEvent.change(screen.getByLabelText('Street address *'), { target: { value: '<script>alert(1)</script>' } })
    fireEvent.change(screen.getByLabelText('City *'), { target: { value: 'Springfield' } })
    fireEvent.change(screen.getByLabelText('State / Province *'), { target: { value: 'IL' } })
    fireEvent.change(screen.getByLabelText('ZIP / Postal code *'), { target: { value: '62701' } })
    fireEvent.change(screen.getByLabelText('Country *'), { target: { value: 'US' } })
    fireEvent.click(screen.getByText('Verify address'))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Street address contains invalid characters')).toBeInDocument()
  })

  it('does not submit when address contains SQL injection payload', () => {
    const onSubmit = vi.fn()
    render(<AddressVerificationForm onSubmit={onSubmit} />)
    fireEvent.change(screen.getByLabelText('Street address *'), { target: { value: "'; DROP TABLE users; --" } })
    fireEvent.change(screen.getByLabelText('City *'), { target: { value: 'Springfield' } })
    fireEvent.change(screen.getByLabelText('State / Province *'), { target: { value: 'IL' } })
    fireEvent.change(screen.getByLabelText('ZIP / Postal code *'), { target: { value: '62701' } })
    fireEvent.change(screen.getByLabelText('Country *'), { target: { value: 'US' } })
    fireEvent.click(screen.getByText('Verify address'))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Street address contains invalid characters')).toBeInDocument()
  })

  it('submits valid address', () => {
    const onSubmit = vi.fn()
    render(<AddressVerificationForm onSubmit={onSubmit} />)
    fireEvent.change(screen.getByLabelText('Street address *'), { target: { value: '123 Main St' } })
    fireEvent.change(screen.getByLabelText('City *'), { target: { value: 'Springfield' } })
    fireEvent.change(screen.getByLabelText('State / Province *'), { target: { value: 'IL' } })
    fireEvent.change(screen.getByLabelText('ZIP / Postal code *'), { target: { value: '62701' } })
    fireEvent.change(screen.getByLabelText('Country *'), { target: { value: 'US' } })
    fireEvent.click(screen.getByText('Verify address'))
    expect(onSubmit).toHaveBeenCalled()
  })
})
