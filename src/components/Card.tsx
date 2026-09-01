import { type HTMLAttributes, type ReactNode } from 'react'

/**
 * Heliobond Card — standard container surface with consistent background,
 * border-radius, border, shadow, and default padding.
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Elements to render inside the card container. */
  children: ReactNode
}

export function Card({ children, style, className, ...props }: CardProps) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--ink-12)',
        borderRadius: 'var(--radius-card)',
        padding: 24,
        boxShadow: 'var(--shadow-sm)',
        ...style,
      }}
      className={['card', className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
