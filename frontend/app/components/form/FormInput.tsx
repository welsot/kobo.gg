import React from 'react';
import { clsx } from 'clsx';

type FormInputProps = {
  id: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  readonly?: boolean;
};

export function FormInput({
  id,
  type = 'text',
  placeholder,
  required = false,
  value,
  onChange,
  disabled,
  readonly,
}: FormInputProps) {
  return (
    <input
      id={id}
      name={id}
      type={type}
      placeholder={placeholder}
      required={required}
      value={value}
      onChange={onChange}
      disabled={disabled || false}
      readOnly={readonly || false}
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
