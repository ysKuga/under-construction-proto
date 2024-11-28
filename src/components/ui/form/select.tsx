'use client';

import * as React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

import { cn } from '@/utils/cn';

import { FieldWrapper, FieldWrapperPassThroughProps } from './field-wrapper';

type Option = {
  label: React.ReactNode;
  value: number | string | string[];
};

type SelectFieldProps = {
  className?: string;
  defaultValue?: string;
  options: Option[];
  registration: Partial<UseFormRegisterReturn>;
} & FieldWrapperPassThroughProps;

export const Select = (props: SelectFieldProps) => {
  const { className, defaultValue, error, label, options, registration } =
    props;
  return (
    <FieldWrapper error={error} label={label}>
      <select
        className={cn(
          'mt-1 block w-full rounded-md border-gray-600 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm',
          className,
        )}
        defaultValue={defaultValue}
        {...registration}
      >
        {options.map(({ label, value }) => (
          <option key={label?.toString()} value={value}>
            {label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
};
