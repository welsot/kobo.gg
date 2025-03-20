import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  MandateContactInfoDto,
  MandateDraftDto,
  MandateRealEstateDto,
  UserDto,
} from '~/api/apiSchemas';
import { toStrOrNull } from '~/utils/form';

export type MandateSubmissionForm = {
  // Who Can Submit Deals
  dealSources: string[];

  // Investment Strategy Focus
  investmentStrategy: string | null;
  otherStrategy: string | null;

  // Strategy-Specific Details - Real Estate
  realEstate: {
    propertyType: string | null;
    otherPropertyType?: string | null;
    riskReturnProfile: string | null;
    otherRiskProfile?: string | null;
    checkSize: string | null;
    geographicalFocus: string | null;
    otherGeography: string | null;
    holdPeriod: string | null;
    projectStage: string | null;
    otherProjectStage: string | null;
  } | null;

  // Strategy-Specific Details - Private Equity
  privateEquity: {
    preferredStrategy: string | null;
    otherStrategy: string | null;
    industryFocus: string | null;
    otherIndustry: string | null;
    checkSize: string | null;
    controlPreference: string | null;
    companyStage: string | null;
  } | null;

  // Strategy-Specific Details - Trophy Assets
  trophyAssets: {
    assetType: string | null;
    otherAssetType: string | null;
    preferredGeography: string | null;
    geographyDetails: string | null;
    taxPreferences: string | null;
    taxPreferencesDetails: string | null;
  } | null;

  // Strategy-Specific Details - Funds
  funds: {
    fundType: string | null;
    otherFundType: string | null;
    fundStage: string | null;
    sectorFocus: string | null;
    otherSector: string | null;
    checkSize: string | null;
  } | null;

  // Strategy-Specific Details - Tax-Advantaged
  taxAdvantaged: {
    primaryTaxProgram: string | null;
    otherTaxProgram: string | null;
    preferredStructures: string | null;
    otherStructure: string | null;
    geographicFocus: string | null;
    geographyDetails: string | null;
  } | null;

  // Instruments & Structure
  instrumentType: string | null;
  otherInstrumentType: string | null;
  syndicationPreference: string | null;

  // Exclusions & Hurdles
  dealBreakers: string | null;
  minimumReturnTarget: string | null;
  minimumReturnTargetCustomValue: string | null;
  sponsorTrackRecord: string | null;
  geographicalRestrictions: string | null;

  // Additional Details
  additionalDetails: string | null;

  // Contact Information
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };

  termsAgreed: boolean;
};

type MandateSubmissionData = {
  form: MandateSubmissionForm;
};

type MandateSubmissionActions = {
  setForm: (info: Partial<MandateSubmissionForm>) => void;
  resetForm: () => void;
};

type MandateSubmissionState = MandateSubmissionData & MandateSubmissionActions;

// Initial state values
const initialState: MandateSubmissionData = {
  form: {
    // Who Can Submit Deals
    dealSources: [],

    // Investment Strategy Focus
    investmentStrategy: null,
    otherStrategy: null,

    // Strategy-Specific Details - Real Estate
    realEstate: {
      propertyType: null,
      riskReturnProfile: null,
      checkSize: null,
      geographicalFocus: null,
      otherGeography: null,
      holdPeriod: null,
      projectStage: null,
      otherProjectStage: null,
    },

    // Strategy-Specific Details - Private Equity
    privateEquity: {
      preferredStrategy: null,
      otherStrategy: null,
      industryFocus: null,
      otherIndustry: null,
      checkSize: null,
      controlPreference: null,
      companyStage: null,
    },

    // Strategy-Specific Details - Trophy Assets
    trophyAssets: {
      assetType: null,
      otherAssetType: null,
      preferredGeography: null,
      geographyDetails: null,
      taxPreferences: null,
      taxPreferencesDetails: null,
    },

    // Strategy-Specific Details - Funds
    funds: {
      fundType: null,
      otherFundType: null,
      fundStage: null,
      sectorFocus: null,
      otherSector: null,
      checkSize: null,
    },

    // Strategy-Specific Details - Tax-Advantaged
    taxAdvantaged: {
      primaryTaxProgram: null,
      otherTaxProgram: null,
      preferredStructures: null,
      otherStructure: null,
      geographicFocus: null,
      geographyDetails: null,
    },

    // Instruments & Structure
    instrumentType: null,
    otherInstrumentType: null,
    syndicationPreference: null,

    // Exclusions & Hurdles
    dealBreakers: null,
    minimumReturnTarget: null,
    minimumReturnTargetCustomValue: null,
    sponsorTrackRecord: null,
    geographicalRestrictions: null,

    // Additional Details
    additionalDetails: null,

    // Contact Information
    contactInfo: {
      name: '',
      email: '',
      phone: '',
    },

    termsAgreed: false,
  },
};

// Create the store with persistence
export const useMandateSubmissionStore = create<MandateSubmissionState>()(
  persist(
    (set) => ({
      // Initial state
      ...initialState,
      resetForm: () => set(initialState),
      setForm: (info) => set((state) => ({ form: { ...state.form, ...info } })),
    }),
    {
      name: 'mandate-submission-storage', // localStorage key
    },
  ),
);

export function mapFormToMandateDraft(form: MandateSubmissionForm, user: UserDto): MandateDraftDto {
  let realEstate: MandateRealEstateDto | null = null;

  if (form.investmentStrategy === 'realEstate') {
    realEstate = {
      propertyType: form.realEstate?.propertyType || null,
      otherPropertyType: form.realEstate?.otherPropertyType || null,
      riskReturnProfile: form.realEstate?.riskReturnProfile || null,
      otherRiskProfile: form.realEstate?.otherRiskProfile || null,
      checkSize: form.realEstate?.checkSize || null,
      geographicalFocus: form.realEstate?.geographicalFocus || null,
      otherGeography: form.realEstate?.otherGeography || null,
      holdPeriod: form.realEstate?.holdPeriod || null,
      projectStage: form.realEstate?.projectStage || null,
      otherProjectStage: form.realEstate?.otherProjectStage || null,
    };
  }

  const investor = user.investorProfile;
  const investorFullName = investor
    ? `${investor.fullName.firstName} ${investor.fullName.lastName}`
    : '';

  const contactInfo: MandateContactInfoDto = {
    name: form.contactInfo.name || investorFullName || '',
    email: form.contactInfo.email || user.email || '',
    phone: toStrOrNull(form.contactInfo.phone || investor?.phoneNumber),
  };

  return {
    dealSources: form.dealSources,
    investmentStrategy: !!form.investmentStrategy ? form.investmentStrategy : null,
    otherStrategy: form.otherStrategy || null,
    realEstate: realEstate,
    privateEquity: form.privateEquity || null,
    trophyAssets: form.trophyAssets || null,
    funds: form.funds || null,
    taxAdvantaged: form.taxAdvantaged || null,
    instrumentType: form.instrumentType || null,
    otherInstrumentType: form.otherInstrumentType || null,
    syndicationPreference: form.syndicationPreference || null,
    dealBreakers: form.dealBreakers || null,
    minimumReturnTarget: form.minimumReturnTarget || null,
    minimumReturnTargetCustomValue:
      form.minimumReturnTarget === 'custom' ? form.minimumReturnTargetCustomValue || null : null,
    sponsorTrackRecord: form.sponsorTrackRecord || null,
    geographicalRestrictions: form.geographicalRestrictions || null,
    additionalDetails: form.additionalDetails || null,
    contactInfo: contactInfo,
    termsAgreed: form.termsAgreed,
  };
}
