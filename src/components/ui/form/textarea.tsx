import * as React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

import { cn } from '@/utils/cn';

import { FieldWrapper, FieldWrapperPassThroughProps } from './field-wrapper';

export type TextareaProps = {
  className?: string;
  registration: Partial<UseFormRegisterReturn>;
} & FieldWrapperPassThroughProps &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, registration, ...props }, ref) => {
    return (
      <FieldWrapper error={error} label={label}>
        <textarea
          className={cn(
            'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          ref={ref}
          {...registration}
          {...props}
        />
      </FieldWrapper>
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
