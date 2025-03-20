import React from 'react';
import { Switch } from '@headlessui/react';

type FormCheckboxProps = {
  id: string;
  label: React.ReactNode;
  required?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
};

export function FormCheckbox({
  id,
  label,
  required = false,
  checked = false,
  onChange = () => {},
}: FormCheckboxProps) {
  return (
    <Switch.Group as="div" className="flex items-start">
      <Switch
        id={id}
        name={id}
        checked={checked}
        onChange={onChange}
        className={`${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        } relative inline-flex h-5 w-9 min-w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
      >
        <span
          className={`${
            checked ? 'translate-x-5' : 'translate-x-1'
          } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
        />
      </Switch>
      <Switch.Label className="ml-3 text-sm text-gray-700">{label}</Switch.Label>
      {required && (
        <input type="hidden" required={required} name={id} value={checked ? 'true' : ''} />
      )}
    </Switch.Group>
  );
}
