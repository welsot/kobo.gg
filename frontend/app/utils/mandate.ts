// ----- STEP 1: Who Can Submit Deals -----
import type { MandateDto, PublicMandateDto } from '~/api/apiSchemas';
import type { MandateCardProps } from '~/components/MandateCard';

export type InvestmentStrategy =
  | 'realEstate'
  | 'privateEquity'
  | 'trophyAssets'
  | 'funds'
  | 'taxAdvantaged'
  | 'other';

export const dealSourceOptions = [
  { value: 'directOwners', label: 'Direct owners (e.g., business owners, property owners)' },
  { value: 'dealSponsors', label: 'Deal sponsors or operators' },
  { value: 'advisors', label: 'Advisors or intermediaries (e.g., bankers, consultants)' },
  {
    value: 'serviceProviders',
    label: 'Service providers (e.g., operators offering specialized services)',
  },
];

// ----- STEP 2: Investment Strategy Focus -----
export const investmentStrategyOptions = [
  { value: 'realEstate', label: 'Real Estate' },
  { value: 'privateEquity', label: 'Private Equity' },
  {
    value: 'trophyAssets',
    label: 'Trophy Assets (e.g., jets, yachts, sports teams, entertainment/media, etc.)',
  },
  { value: 'funds', label: 'Funds (PE, VC, Private Credit, etc.)' },
  { value: 'taxAdvantaged', label: 'Tax-Advantaged (e.g., Opportunity Zones, Solar, Oil & Gas)' },
  { value: 'other', label: 'Other' },
];

// ----- STEP 3: Strategy-Specific Details -----

// A. Real Estate Options
export const realEstatePropertyTypeOptions = [
  { value: 'multifamily', label: 'Multifamily' },
  { value: 'industrialWarehouse', label: 'Industrial/Warehouse' },
  { value: 'office', label: 'Office' },
  { value: 'retail', label: 'Retail' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'mixedUse', label: 'Mixed-Use' },
  { value: 'other', label: 'Other' },
];

export const realEstateRiskReturnOptions = [
  { value: 'core', label: 'Core' },
  { value: 'corePlus', label: 'Core-Plus' },
  { value: 'valueAdd', label: 'Value-Add' },
  { value: 'opportunistic', label: 'Opportunistic' },
  { value: 'distressed', label: 'Distressed' },
  { value: 'other', label: 'Other' },
];

export const realEstateCheckSizeOptions = [
  { value: 'under5m', label: '< $5M' },
  { value: '5mto20m', label: '$5M – $20M' },
  { value: '20mto100m', label: '$20M – $100M' },
  { value: 'over100m', label: '$100M+' },
];

export const realEstateGeographicalFocusOptions = [
  { value: 'northAmerica', label: 'North America' },
  { value: 'europe', label: 'Europe' },
  { value: 'asiaPacific', label: 'Asia-Pacific' },
  { value: 'latinAmerica', label: 'Latin America' },
  { value: 'global', label: 'Global' },
  { value: 'other', label: 'Other' },
];

export const realEstateHoldPeriodOptions = [
  { value: 'under3years', label: '< 3 years' },
  { value: '3to5years', label: '3–5 years' },
  { value: '5to7years', label: '5–7 years' },
  { value: 'over7years', label: '7+ years' },
];

export const realEstateProjectStageOptions = [
  { value: 'groundUp', label: 'Ground-up Development' },
  { value: 'valueAdd', label: 'Value-Add / Redevelopment' },
  { value: 'stabilized', label: 'Stabilized Assets' },
  { value: 'other', label: 'Other' },
];

// B. Private Equity Options
export const privateEquityStrategyOptions = [
  { value: 'm&a', label: 'M&A (Buyouts)' },
  { value: 'growthCapital', label: 'Growth Capital' },
  { value: 'rollups', label: 'Roll-ups' },
  { value: 'minorityStakes', label: 'Minority Stakes' },
  { value: 'other', label: 'Other' },
];

export const privateEquityIndustryOptions = [
  { value: 'tech', label: 'Tech' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'consumerRetail', label: 'Consumer/Retail' },
  { value: 'industrialManufacturing', label: 'Industrial/Manufacturing' },
  { value: 'energyInfrastructure', label: 'Energy/Infrastructure' },
  { value: 'other', label: 'Other' },
];

export const privateEquityCheckSizeOptions = [
  { value: 'under5m', label: '< $5M' },
  { value: '5mto25m', label: '$5M – $25M' },
  { value: '25mto100m', label: '$25M – $100M' },
  { value: 'over100m', label: '$100M+' },
];

export const privateEquityControlOptions = [
  { value: 'majorityControl', label: 'Majority Control' },
  { value: 'minorityStake', label: 'Minority Stake' },
  { value: 'flexible', label: 'Flexible' },
];

export const privateEquityCompanyStageOptions = [
  { value: 'earlyStage', label: 'Early-Stage (Pre-Profit)' },
  { value: 'growthStage', label: 'Growth-Stage' },
  { value: 'matureStage', label: 'Mature / Late-Stage' },
  { value: 'buyout', label: 'Buyout' },
];

// C. Trophy Assets Options
export const trophyAssetTypeOptions = [
  { value: 'sportsTeams', label: 'Sports Teams' },
  {
    value: 'entertainmentMedia',
    label: 'Entertainment/Media (e.g., music catalogs, film rights)',
  },
  { value: 'artCollectibles', label: 'Art/Collectibles' },
  { value: 'privateJets', label: 'Private Jets' },
  { value: 'yachts', label: 'Yachts' },
  { value: 'other', label: 'Other' },
];

export const trophyAssetGeographyOptions = [
  { value: 'domestic', label: 'Domestic' },
  { value: 'global', label: 'Global' },
  { value: 'other', label: 'Other' },
];

export const trophyAssetTaxPreferencesOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

// D. Funds Options
export const fundTypeOptions = [
  { value: 'privateEquityFund', label: 'Private Equity Fund' },
  { value: 'ventureCapitalFund', label: 'Venture Capital Fund' },
  { value: 'privateCreditFund', label: 'Private Credit Fund' },
  { value: 'hedgeFund', label: 'Hedge Fund' },
  { value: 'fundOfFunds', label: 'Fund of Funds' },
  { value: 'other', label: 'Other' },
];

export const fundStageOptions = [
  { value: 'emerging', label: 'Emerging (first-time or second fund)' },
  { value: 'established', label: 'Established (Fund II, III, etc.)' },
  { value: 'largeScale', label: 'Large-Scale ($500M+)' },
];

export const fundSectorFocusOptions = [
  { value: 'tech', label: 'Tech' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'consumer', label: 'Consumer' },
  { value: 'diversified', label: 'Diversified' },
  { value: 'other', label: 'Other' },
];

export const fundCheckSizeOptions = [
  { value: '1mto5m', label: '$1M – $5M' },
  { value: '5mto20m', label: '$5M – $20M' },
  { value: '20mto50m', label: '$20M – $50M' },
  { value: 'over50m', label: '$50M+' },
];

// E. Tax-Advantaged Options
export const taxProgramOptions = [
  { value: 'opportunityZones', label: 'Opportunity Zones' },
  { value: 'historicRehab', label: 'Historic Rehab Tax Credits' },
  { value: 'newMarkets', label: 'New Markets Tax Credits' },
  { value: 'renewableEnergy', label: 'Renewable Energy Credits' },
  { value: 'other', label: 'Other' },
];

export const taxStructureOptions = [
  { value: 'directInvestments', label: 'Direct Investments' },
  { value: 'fundStructure', label: 'Fund Structure' },
  { value: 'syndicates', label: 'Syndicates' },
  { value: 'other', label: 'Other' },
];

export const taxGeographicFocusOptions = [
  { value: 'northAmerica', label: 'North America' },
  { value: 'international', label: 'International' },
  { value: 'other', label: 'Other' },
];

// ----- STEP 4: Instruments & Structure -----
export const instrumentTypeOptions = [
  { value: 'equity', label: 'Equity' },
  { value: 'debt', label: 'Debt' },
  { value: 'preferredEquity', label: 'Preferred Equity' },
  { value: 'mezzanineDebt', label: 'Mezzanine Debt' },
  { value: 'convertibleNotes', label: 'Convertible Notes' },
  { value: 'other', label: 'Other' },
];

export const syndicationOptions = [
  { value: 'yes', label: 'Yes, open to co-investments or club deals' },
  { value: 'no', label: 'No, prefer standalone or sole investor structure' },
  { value: 'caseByCase', label: 'Case-by-case' },
];

// ----- STEP 5: Exclusions & Hurdles -----
export const minimumReturnOptions = [
  { value: '10IRR', label: '10% IRR' },
  { value: '15IRR', label: '15% IRR' },
  { value: '20IRR', label: '20% IRR' },
  { value: '25IRR', label: '25% IRR' },
  { value: '2xMOIC', label: '2x MOIC' },
  { value: '2.5xMOIC', label: '2.5x MOIC' },
  { value: '3xMOIC', label: '3x MOIC' },
  { value: 'custom', label: 'Custom' },
];

export const sponsorTrackRecordOptions = [
  { value: 'noRequirement', label: 'No specific requirement' },
  { value: '1to3years', label: '1–3 years' },
  { value: '3to5years', label: '3–5 years' },
  { value: 'over5years', label: '5+ years' },
  { value: 'flexible', label: 'Flexible' },
];

type FieldOptionsMap = {
  dealSource: typeof dealSourceOptions;
  investmentStrategy: typeof investmentStrategyOptions;
  realEstatePropertyType: typeof realEstatePropertyTypeOptions;
  realEstateRiskReturn: typeof realEstateRiskReturnOptions;
  realEstateCheckSize: typeof realEstateCheckSizeOptions;
  realEstateGeographicalFocus: typeof realEstateGeographicalFocusOptions;
  realEstateHoldPeriod: typeof realEstateHoldPeriodOptions;
  realEstateProjectStage: typeof realEstateProjectStageOptions;
  privateEquityStrategy: typeof privateEquityStrategyOptions;
  privateEquityIndustry: typeof privateEquityIndustryOptions;
  privateEquityCheckSize: typeof privateEquityCheckSizeOptions;
  privateEquityControl: typeof privateEquityControlOptions;
  privateEquityCompanyStage: typeof privateEquityCompanyStageOptions;
  trophyAssetType: typeof trophyAssetTypeOptions;
  trophyAssetGeography: typeof trophyAssetGeographyOptions;
  trophyAssetTaxPreferences: typeof trophyAssetTaxPreferencesOptions;
  fundType: typeof fundTypeOptions;
  fundStage: typeof fundStageOptions;
  fundSectorFocus: typeof fundSectorFocusOptions;
  fundCheckSize: typeof fundCheckSizeOptions;
  taxProgram: typeof taxProgramOptions;
  taxStructure: typeof taxStructureOptions;
  taxGeographicFocus: typeof taxGeographicFocusOptions;
  instrumentType: typeof instrumentTypeOptions;
  syndication: typeof syndicationOptions;
  minimumReturn: typeof minimumReturnOptions;
  sponsorTrackRecord: typeof sponsorTrackRecordOptions;
};

const optionsMap: FieldOptionsMap = {
  dealSource: dealSourceOptions,
  investmentStrategy: investmentStrategyOptions,
  realEstatePropertyType: realEstatePropertyTypeOptions,
  realEstateRiskReturn: realEstateRiskReturnOptions,
  realEstateCheckSize: realEstateCheckSizeOptions,
  realEstateGeographicalFocus: realEstateGeographicalFocusOptions,
  realEstateHoldPeriod: realEstateHoldPeriodOptions,
  realEstateProjectStage: realEstateProjectStageOptions,
  privateEquityStrategy: privateEquityStrategyOptions,
  privateEquityIndustry: privateEquityIndustryOptions,
  privateEquityCheckSize: privateEquityCheckSizeOptions,
  privateEquityControl: privateEquityControlOptions,
  privateEquityCompanyStage: privateEquityCompanyStageOptions,
  trophyAssetType: trophyAssetTypeOptions,
  trophyAssetGeography: trophyAssetGeographyOptions,
  trophyAssetTaxPreferences: trophyAssetTaxPreferencesOptions,
  fundType: fundTypeOptions,
  fundStage: fundStageOptions,
  fundSectorFocus: fundSectorFocusOptions,
  fundCheckSize: fundCheckSizeOptions,
  taxProgram: taxProgramOptions,
  taxStructure: taxStructureOptions,
  taxGeographicFocus: taxGeographicFocusOptions,
  instrumentType: instrumentTypeOptions,
  syndication: syndicationOptions,
  minimumReturn: minimumReturnOptions,
  sponsorTrackRecord: sponsorTrackRecordOptions,
};

export function getMandateValueLabel(
  fieldId: keyof FieldOptionsMap,
  value: string,
): string | undefined {
  const options = optionsMap[fieldId];
  const option = options.find((opt) => opt.value === value);

  if (!option) {
    console.error(`Could not find option for field ${fieldId} with value ${value}`);
    return value;
  }

  return option.label;
}

export function mapPublicMandateToCardProps(mandate: PublicMandateDto): MandateCardProps {
  // Determine the investment type based on mandate's strategy
  let investmentType = 'Investment Opportunity';
  if (mandate.investmentStrategy) {
    investmentType =
      getMandateValueLabel('investmentStrategy', mandate.investmentStrategy) || investmentType;

    if (mandate.investmentStrategy === 'trophyAssets') {
      investmentType = 'Trophy Assets'; // Instead of too long version "Trophy Assets (e.g., jets, yachts, sports teams, entertainment/media, etc.)"
    }
  }

  // Determine check size based on mandate type
  let checkSize = 'Varies';
  if (mandate.realEstate?.checkSize) {
    checkSize =
      getMandateValueLabel('realEstateCheckSize', mandate.realEstate.checkSize) || checkSize;
  } else if (mandate.privateEquity?.checkSize) {
    checkSize =
      getMandateValueLabel('privateEquityCheckSize', mandate.privateEquity.checkSize) || checkSize;
  } else if (mandate.funds?.checkSize) {
    checkSize = getMandateValueLabel('fundCheckSize', mandate.funds.checkSize) || checkSize;
  }

  // Determine location
  let location = 'Global';
  if (mandate.realEstate?.geographicalFocus) {
    location =
      getMandateValueLabel('realEstateGeographicalFocus', mandate.realEstate.geographicalFocus) ||
      location;
  } else if (mandate.geographicalRestrictions) {
    location = mandate.geographicalRestrictions;
  }

  // Determine target return
  let targetReturn = 'Market Rate';
  if (mandate.minimumReturnTarget) {
    targetReturn =
      getMandateValueLabel('minimumReturn', mandate.minimumReturnTarget) || targetReturn;
    if (mandate.minimumReturnTarget === 'custom' && mandate.minimumReturnTargetCustomValue) {
      targetReturn = mandate.minimumReturnTargetCustomValue;
    }
  }

  // Generate a title based on the investment type and additional details
  let titlePrefix = 'Investment';

  switch (mandate.investmentStrategy) {
    case 'realEstate':
      titlePrefix = 'Real Estate';
      break;
    case 'privateEquity':
      titlePrefix = 'Private Equity';
      break;
    case 'trophyAssets':
      titlePrefix = 'Trophy Asset';
      break;
    case 'funds':
      titlePrefix = 'Fund';
      break;
    case 'taxAdvantaged':
      titlePrefix = 'Tax-Advantaged';
      break;
  }

  let title = `${titlePrefix} Mandate`;

  // Add more specific details if available
  if (mandate.realEstate?.propertyType) {
    const propertyType = getMandateValueLabel(
      'realEstatePropertyType',
      mandate.realEstate.propertyType,
    );
    if (propertyType) {
      title = `${propertyType} ${title}`;
    }
  } else if (mandate.privateEquity?.industryFocus) {
    const industry = getMandateValueLabel(
      'privateEquityIndustry',
      mandate.privateEquity.industryFocus,
    );
    if (industry) {
      title = `${industry} ${title}`;
    }
  }

  const additionalDetails = String(mandate.additionalDetails || '').trim();

  return {
    id: mandate.id,
    title,
    investmentType,
    checkSize,
    location,
    targetReturn,
    additionalDetails,
  };
}

export function mapMandateToCardProps(mandate: MandateDto): MandateCardProps {
  const publicMandate = { ...mandate, id: mandate.mandateId } as PublicMandateDto;
  return mapPublicMandateToCardProps(publicMandate);
}
