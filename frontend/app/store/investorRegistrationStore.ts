import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type InvestorRegistrationForm = {
  email: string;
  fullName: {
    firstName: string;
    lastName: string;
  };
  countryOfResidence: number | null;
  stateOfResidence: string | null;
  referralSource: string | null;
  phoneNumber: string | null;
  linkedinUrl: string | null;
  investorType: string | null;
  acceptedNoAlternativeUse: boolean;
  acceptedRiskAcknowledgement: boolean;
  acceptedLegalAcknowledgement: boolean;
  acceptedAnonymousDistribution: boolean;
  accreditationConfirmation: boolean;
  accreditedInvestorStatus: string | null;
  lpInvestingExperience: string | null;
  deployedAmount: string | null;
  expectedDeploymentAmount: string | null;
  netWorth: string | null;
};

type InvestorRegistrationData = {
  form: InvestorRegistrationForm;
  basicInfoSubmitted: boolean;
};

type InvestorRegistrationActions = {
  setForm: (info: Partial<InvestorRegistrationForm>) => void;
  setBasicInfoSubmitted: (submitted: boolean) => void;
  resetForm: () => void;
};

type InvestorRegistrationState = InvestorRegistrationData & InvestorRegistrationActions;

// Initial state values
const initialState: InvestorRegistrationData = {
  basicInfoSubmitted: false,
  form: {
    email: '',
    fullName: {
      firstName: '',
      lastName: '',
    },
    countryOfResidence: null,
    stateOfResidence: null,
    referralSource: null,
    phoneNumber: null,
    linkedinUrl: null,
    investorType: null,
    acceptedNoAlternativeUse: false,
    acceptedRiskAcknowledgement: false,
    acceptedLegalAcknowledgement: false,
    acceptedAnonymousDistribution: false,
    accreditationConfirmation: false,
    accreditedInvestorStatus: null,
    lpInvestingExperience: null,
    deployedAmount: null,
    expectedDeploymentAmount: null,
    netWorth: null,
  },
};

// Create the store with persistence
export const useInvestorRegistrationStore = create<InvestorRegistrationState>()(
  persist(
    (set) => ({
      // Initial state
      ...initialState,
      setBasicInfoSubmitted: (submitted) => set({ basicInfoSubmitted: submitted }),
      resetForm: () => set(initialState),
      setForm: (info) => set((state) => ({ form: { ...state.form, ...info } })),
    }),
    {
      name: 'investor-registration-storage', // localStorage key
    },
  ),
);
