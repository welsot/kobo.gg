import React, { useState } from 'react';

type Option = {
  value: string;
  label: string;
};

type FormRadioGroupProps = {
  name: string;
  options: Option[];
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
};

export function FormRadioGroup({
  name,
  options,
  required = false,
  value: externalValue,
  onChange: externalOnChange,
}: FormRadioGroupProps) {
  const [internalValue, setInternalValue] = useState(externalValue || options[0]?.value || '');

  const handleChange = (event: any) => {
    const newValue = event.target.value;
    setInternalValue(newValue);
    if (externalOnChange) {
      externalOnChange(newValue);
    }
  };

  const value = externalValue !== undefined ? externalValue : internalValue;

  return (
    <div className="space-y-2">
      {options.map((option) => (
        <label
          key={option.value}
          className="flex items-center cursor-pointer group focus-within:ring-2 focus-within:ring-blue-500 focus-within:rounded-sm"
        >
          <div className="relative flex items-center">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={handleChange}
              required={required}
              className="opacity-0 absolute h-4 w-4 cursor-pointer"
            />
            <div
              className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                value === option.value
                  ? 'border-transparent bg-blue-600'
                  : 'border-gray-300 bg-white'
              }`}
            >
              {value === option.value && <span className="h-2 w-2 rounded-full bg-white" />}
            </div>
          </div>
          <span className="ml-3 text-gray-700">{option.label}</span>
        </label>
      ))}
    </div>
  );
}
