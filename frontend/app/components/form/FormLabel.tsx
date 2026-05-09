import React from 'react';

type FormLabelProps = {
  children: React.ReactNode;
  htmlFor: string;
  required?: boolean;
};

export function FormLabel({ children, htmlFor, required }: FormLabelProps) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
      {children}
      {required && (
        <>
          &nbsp;
          <Req />
        </>
      )}
    </label>
  );
}

export function Req() {
  return <span className="text-red-500">*</span>;
}
