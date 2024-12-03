import * as React from 'react'
import { type UseFormRegisterReturn } from 'react-hook-form'

import { cn } from '@/utils/cn'

import { FieldWrapper, FieldWrapperPassThroughProps } from './field-wrapper'

export type InputProps = {
  className?: string
  registration: Partial<UseFormRegisterReturn>
} & FieldWrapperPassThroughProps &
  React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, registration, type, ...props }, ref) => {
    return (
      <FieldWrapper error={error} label={label}>
        <input
          className={cn(
            'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          ref={ref}
          type={type}
          {...registration}
          {...props}
        />
      </FieldWrapper>
    )
  },
)
Input.displayName = 'Input'

export { Input }
