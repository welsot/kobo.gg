import React from 'react';
import { clsx } from 'clsx';

type FormTextareaProps = {
  id: string;
  placeholder?: string;
  required?: boolean;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  readonly?: boolean;
  rows?: number;
};

export function FormTextarea({
  id,
  placeholder,
  required = false,
  value,
  onChange,
  disabled,
  readonly,
  rows = 3,
}: FormTextareaProps) {
  return (
    <textarea
      id={id}
      name={id}
      placeholder={placeholder}
      required={required}
      value={value}
      onChange={onChange}
      disabled={disabled || false}
      readOnly={readonly || false}
      rows={rows}
      className={clsx(
        'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500',
        {
          'cursor-not-allowed': readonly || disabled || false,
          'opacity-70': readonly || disabled || false,
        },
      )}
    />
  );
}
