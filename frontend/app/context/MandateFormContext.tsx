import type { ChangeEvent, ReactNode } from 'react';
import { createContext, useContext } from 'react';
import type { MandateSubmissionForm } from '~/store/mandateSubmissionStore';
import {
  dealSourceOptions,
  fundCheckSizeOptions,
  fundSectorFocusOptions,
  fundStageOptions,
  fundTypeOptions,
  instrumentTypeOptions,
  investmentStrategyOptions,
  minimumReturnOptions,
  privateEquityCheckSizeOptions,
  privateEquityCompanyStageOptions,
  privateEquityControlOptions,
  privateEquityIndustryOptions,
  privateEquityStrategyOptions,
  realEstateCheckSizeOptions,
  realEstateGeographicalFocusOptions,
  realEstateHoldPeriodOptions,
  realEstateProjectStageOptions,
  realEstatePropertyTypeOptions,
  realEstateRiskReturnOptions,
  sponsorTrackRecordOptions,
  syndicationOptions,
  taxGeographicFocusOptions,
  taxProgramOptions,
  taxStructureOptions,
  trophyAssetGeographyOptions,
  trophyAssetTaxPreferencesOptions,
  trophyAssetTypeOptions,
} from '~/utils/mandate';

// Define the option type for select inputs
export type SelectOption = {
  value: string;
  label: string;
};

// Define the context type
export type MandateFormContextType = {
  // Form data and handlers
  form: MandateSubmissionForm;
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
  handleSelectChange: (id: string, value: string | number) => void;
  handleFieldUpdate: (fieldId: string, value: any) => void;

  // Helper for nested fields
  updateNestedField: (section: string, field: string, value: any) => void;
  handleNestedInputChange: (
    section: string,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;

  // Step 1: Who Can Submit Deals
  dealSourceOptions: SelectOption[];

  // Step 2: Investment Strategy Focus
  investmentStrategyOptions: SelectOption[];

  // Step 3: Strategy-Specific Details - Real Estate
  realEstatePropertyTypeOptions: SelectOption[];
  realEstateRiskReturnOptions: SelectOption[];
  realEstateCheckSizeOptions: SelectOption[];
  realEstateGeographicalFocusOptions: SelectOption[];
  realEstateHoldPeriodOptions: SelectOption[];
  realEstateProjectStageOptions: SelectOption[];

  // Step 3: Strategy-Specific Details - Private Equity
  privateEquityStrategyOptions: SelectOption[];
  privateEquityIndustryOptions: SelectOption[];
  privateEquityCheckSizeOptions: SelectOption[];
  privateEquityControlOptions: SelectOption[];
  privateEquityCompanyStageOptions: SelectOption[];

  // Step 3: Strategy-Specific Details - Trophy Assets
  trophyAssetTypeOptions: SelectOption[];
  trophyAssetGeographyOptions: SelectOption[];
  trophyAssetTaxPreferencesOptions: SelectOption[];

  // Step 3: Strategy-Specific Details - Funds
  fundTypeOptions: SelectOption[];
  fundStageOptions: SelectOption[];
  fundSectorFocusOptions: SelectOption[];
  fundCheckSizeOptions: SelectOption[];

  // Step 3: Strategy-Specific Details - Tax-Advantaged
  taxProgramOptions: SelectOption[];
  taxStructureOptions: SelectOption[];
  taxGeographicFocusOptions: SelectOption[];

  // Step 4: Instruments & Structure
  instrumentTypeOptions: SelectOption[];
  syndicationOptions: SelectOption[];

  // Step 5: Exclusions & Hurdles
  minimumReturnOptions: SelectOption[];
  sponsorTrackRecordOptions: SelectOption[];
};

// Define the context type
export type MandateFormContextInputValueType = {
  // Form data and handlers
  form: MandateSubmissionForm;
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
  handleSelectChange: (id: string, value: string | number) => void;
  handleFieldUpdate: (fieldId: string, value: any) => void;

  // Helper for nested fields
  updateNestedField: (section: string, field: string, value: any) => void;
  handleNestedInputChange: (
    section: string,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
};

// Create the context with a default undefined value
export const MandateFormContext = createContext<MandateFormContextType | undefined>(undefined);

// Provider props type
type MandateFormProviderProps = {
  children: ReactNode;
  value: MandateFormContextInputValueType;
};

// Provider component
export function MandateFormProvider({ children, value }: MandateFormProviderProps) {
  const fullValue: MandateFormContextType = {
    ...value,
    dealSourceOptions: dealSourceOptions,
    investmentStrategyOptions: investmentStrategyOptions,
    realEstatePropertyTypeOptions: realEstatePropertyTypeOptions,
    realEstateRiskReturnOptions: realEstateRiskReturnOptions,
    realEstateCheckSizeOptions: realEstateCheckSizeOptions,
    realEstateGeographicalFocusOptions: realEstateGeographicalFocusOptions,
    realEstateHoldPeriodOptions: realEstateHoldPeriodOptions,
    realEstateProjectStageOptions: realEstateProjectStageOptions,
    privateEquityStrategyOptions: privateEquityStrategyOptions,
    privateEquityIndustryOptions: privateEquityIndustryOptions,
    privateEquityCheckSizeOptions: privateEquityCheckSizeOptions,
    privateEquityControlOptions: privateEquityControlOptions,
    privateEquityCompanyStageOptions: privateEquityCompanyStageOptions,
    trophyAssetTypeOptions: trophyAssetTypeOptions,
    trophyAssetGeographyOptions: trophyAssetGeographyOptions,
    trophyAssetTaxPreferencesOptions: trophyAssetTaxPreferencesOptions,
    fundTypeOptions: fundTypeOptions,
    fundStageOptions: fundStageOptions,
    fundSectorFocusOptions: fundSectorFocusOptions,
    fundCheckSizeOptions: fundCheckSizeOptions,
    taxProgramOptions: taxProgramOptions,
    taxStructureOptions: taxStructureOptions,
    taxGeographicFocusOptions: taxGeographicFocusOptions,
    instrumentTypeOptions: instrumentTypeOptions,
    syndicationOptions: syndicationOptions,
    minimumReturnOptions: minimumReturnOptions,
    sponsorTrackRecordOptions: sponsorTrackRecordOptions,
  };
  return <MandateFormContext.Provider value={fullValue}>{children}</MandateFormContext.Provider>;
}

// Custom hook for using the context
export function useMandateForm() {
  const context = useContext(MandateFormContext);

  if (context === undefined) {
    throw new Error('useMandateForm must be used within a MandateFormProvider');
  }

  return context;
}
