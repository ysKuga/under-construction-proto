import * as React from 'react'
import { type FieldError } from 'react-hook-form'

import { Error } from './error'
import { Label } from './label'

type FieldWrapperProps = {
  children: React.ReactNode
  className?: string
  error?: FieldError | undefined
  label?: string
}

export type FieldWrapperPassThroughProps = Omit<
  FieldWrapperProps,
  'children' | 'className'
>

export const FieldWrapper = (props: FieldWrapperProps) => {
  const { children, error, label } = props
  return (
    <div>
      <Label>
        {label}
        <div className="mt-1">{children}</div>
      </Label>
      <Error errorMessage={error?.message} />
    </div>
  )
}
