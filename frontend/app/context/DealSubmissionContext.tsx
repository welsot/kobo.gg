import type { ChangeEvent, ReactNode } from 'react';
import { createContext, useContext } from 'react';
import type { DealSubmissionForm } from '~/store/dealSubmissionStore';
import type { DealOwnerRoleEnum } from '~/api/apiSchemas';

// Define the option type for select inputs
export type SelectOption = {
  value: string;
  label: string;
};
export type DealOwnerSelectOption = {
  value: DealOwnerRoleEnum;
  label: string;
};

// Define the context type
export type DealSubmissionContextType = {
  // Form data and handlers
  form: DealSubmissionForm;
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
  handleSelectChange: (id: string, value: string | number) => void;
  handleFieldUpdate: (fieldId: string, value: any) => void;
  handleCriteriaAnswer: (criterionId: string, value: boolean) => void;
  handleCriteriaNote: (criterionId: string, note: string) => void;

  // Helper for nested fields
  updateNestedField: (section: string, field: string, value: any) => void;
  handleNestedInputChange: (
    section: string,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;

  // Criteria data
  mandateCriteria: Array<{
    id: string;
    question: React.ReactNode;
    criterionName: string;
    path: string;
  }>;

  // Options for owner type
  ownerTypeOptions: SelectOption[];
};

// Define the context input value type
export type DealSubmissionContextInputValueType = {
  // Form data and handlers
  form: DealSubmissionForm;
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
  handleSelectChange: (id: string, value: string | number) => void;
  handleFieldUpdate: (fieldId: string, value: any) => void;
  handleCriteriaAnswer: (criterionId: string, value: boolean) => void;
  handleCriteriaNote: (criterionId: string, note: string) => void;

  // Helper for nested fields
  updateNestedField: (section: string, field: string, value: any) => void;
  handleNestedInputChange: (
    section: string,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;

  // Criteria data
  mandateCriteria: Array<{
    id: string;
    question: React.ReactNode;
    criterionName: string;
    path: string;
  }>;
};

// Create the context with a default undefined value
export const DealSubmissionContext = createContext<DealSubmissionContextType | undefined>(
  undefined,
);

// Owner type options
const ownerTypeOptions: DealOwnerSelectOption[] = [
  { value: 'BROKER', label: 'Broker' },
  { value: 'SPONSOR', label: 'Sponsor' },
  { value: 'OPERATOR', label: 'Operator' },
  { value: 'GP', label: 'General Partner (GP)' },
  { value: 'LP', label: 'Limited Partner (LP)' },
];

// Provider props type
type DealSubmissionProviderProps = {
  children: ReactNode;
  value: DealSubmissionContextInputValueType;
};

// Provider component
export function DealSubmissionProvider({ children, value }: DealSubmissionProviderProps) {
  const fullValue: DealSubmissionContextType = {
    ...value,
    ownerTypeOptions,
  };
  return (
    <DealSubmissionContext.Provider value={fullValue}>{children}</DealSubmissionContext.Provider>
  );
}

// Custom hook for using the context
export function useDealSubmission() {
  const context = useContext(DealSubmissionContext);

  if (context === undefined) {
    throw new Error('useDealSubmission must be used within a DealSubmissionProvider');
  }

  return context;
}
