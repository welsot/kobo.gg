import React, { useState } from 'react';

type Option = {
  value: string;
  label: string;
};

type FormSelectProps = {
  id: string;
  options: Option[];
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
};

export function FormSelect({
  id,
  options,
  required = false,
  value: externalValue,
  onChange: externalOnChange,
  placeholder = 'Select an option',
}: FormSelectProps) {
  const defaultOption = { value: '', label: placeholder };
  const allOptions = [defaultOption, ...options];

  const [internalSelected, setInternalSelected] = useState(
    externalValue
      ? options.find((opt) => opt.value === externalValue) || defaultOption
      : defaultOption,
  );

  const selected =
    externalValue !== undefined
      ? allOptions.find((opt) => opt.value === externalValue) || defaultOption
      : internalSelected;

  const handleChange = (event: any) => {
    const option = allOptions.find((opt) => opt.value === event.target.value) || defaultOption;
    setInternalSelected(option);
    if (externalOnChange) {
      externalOnChange(option.value);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <select
          id={id}
          name={id}
          value={selected.value}
          onChange={handleChange}
          required={required}
          className="block w-full appearance-none px-3 py-2 text-left border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
          style={{
            // These styles help match the custom select appearance
            WebkitAppearance: 'none',
            MozAppearance: 'none',
          }}
        >
          {allOptions.map((option, index) => (
            <option
              key={index}
              value={option.value}
              className={option.value === '' ? 'text-gray-400' : 'text-gray-900'}
            >
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
