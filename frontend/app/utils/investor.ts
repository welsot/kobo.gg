import type { AccreditedInvestorStatusEnum, InvestorTypeEnum } from '~/api/apiSchemas';

// Referral sources
export const referralSources = [
  { value: 'post', label: 'Saw a post from someone' },
  { value: 'ad', label: 'Advertisement' },
  { value: 'referral', label: 'Referral by a friend / colleague' },
  { value: 'other', label: 'Other' },
];

type InvestorType = { value: InvestorTypeEnum; label: string };

// Investor classification options
export const investorTypes: InvestorType[] = [
  { value: 'INDIVIDUAL', label: 'Individual' },
  { value: 'FAMILY_OFFICE', label: 'Family Office ($25mm+ net worth)' },
  { value: 'ALLOCATOR', label: 'Allocator ($1B+ Firm)' },
  {
    value: 'SERVICE_PROVIDER',
    label: 'Service Provider to LPs who also makes LP investments personally',
  },
];

type AccreditedOption = { value: AccreditedInvestorStatusEnum; label: string };

// Accredited investor options
export const accreditedOptions: AccreditedOption[] = [
  {
    value: 'INDIVIDUAL_INCOME_BASED_QUALIFICATION',
    label: 'INDIVIDUAL – Income-Based Qualification',
  },
  {
    value: 'INDIVIDUAL_NET_WORTH_BASED_QUALIFICATION',
    label: 'INDIVIDUAL – Net Worth-Based Qualification',
  },
  {
    value: 'INDIVIDUAL_PROFESSIONAL_CERTIFICATIONS',
    label: 'INDIVIDUAL – Professional Certifications',
  },
  { value: 'ENTITY_ASSET_BASED_QUALIFICATION', label: 'ENTITY – Asset-Based Qualification' },
  { value: 'ENTITY_INSTITUTIONAL_INVESTORS', label: 'ENTITY – Institutional Investors' },
  { value: 'ENTITY_FAMILY_OFFICES_AND_CLIENTS', label: 'ENTITY – Family Offices and Clients' },
  { value: 'NON_ACCREDITED', label: 'Non-Accredited' },
];

// LP deal experience options
export const dealExperienceOptions = [
  { value: '0', label: '0' },
  { value: '1-5', label: '1–5' },
  { value: '6-25', label: '6–25' },
  { value: '25+', label: '25+' },
];

export const deployedAmountOptions = [
  { value: '0', label: '$0' },
  { value: '500k', label: '$500k' },
  { value: '1mm', label: '$1mm' },
  { value: '5mm+', label: '$5mm+' },
];

export const futureDeploymentOptions = [
  { value: '100k', label: '$100k' },
  { value: '500k', label: '$500k' },
  { value: '1mm', label: '$1mm' },
  { value: '5mm+', label: '$5mm+' },
];

export const netWorthOptions = [
  { value: '1mm', label: '$1mm' },
  { value: '5mm', label: '$5mm' },
  { value: '25mm', label: '$25mm' },
  { value: '100mm+', label: '$100mm+' },
];

type InvestorFieldOptionsMap = {
  referralSource: typeof referralSources;
  investorType: typeof investorTypes;
  accreditedStatus: typeof accreditedOptions;
  dealExperience: typeof dealExperienceOptions;
  deployedAmount: typeof deployedAmountOptions;
  futureDeployment: typeof futureDeploymentOptions;
  netWorth: typeof netWorthOptions;
};

const investorOptionsMap: InvestorFieldOptionsMap = {
  referralSource: referralSources,
  investorType: investorTypes,
  accreditedStatus: accreditedOptions,
  dealExperience: dealExperienceOptions,
  deployedAmount: deployedAmountOptions,
  futureDeployment: futureDeploymentOptions,
  netWorth: netWorthOptions,
};

export function getInvestorValueLabel(
  fieldId: keyof InvestorFieldOptionsMap,
  value: string,
): string | undefined {
  const options = investorOptionsMap[fieldId];
  const option = options.find((opt) => opt.value === value);
  return option?.label;
}
