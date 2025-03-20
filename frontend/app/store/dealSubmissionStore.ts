import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  DealDto,
  DealOwnerDto,
  DealOwnerRoleEnum,
  PublicMandateDto,
  UserDto,
} from '~/api/apiSchemas';
import { type CriterionDefinition, generateMandateCriteria } from '~/utils/criteria';
import type { InvestmentStrategy } from '~/utils/mandate';
import { arr } from '~/utils/arr';
import { toStrOrNull } from '~/utils/form';

export type DealSubmissionForm = {
  // Deal Owner Info
  contactInfo: {
    name: string;
    email: string;
    phone: string;
    type: DealOwnerRoleEnum | null; // broker/sponsor/operator/GP/LP
  };

  // Mandate Criteria Answers
  criteriaAnswers: Record<string, boolean>;

  // Notes for any "No" answers
  criteriaNotes: Record<string, string>;

  // Deal Details
  dealDescription: string | null;

  // File Attachments (will be handled separately in the UI)
  attachments: string[]; // Store file names for display purposes

  // Store attachment IDs received from the server
  attachmentIds: string[]; // Store attachment UUIDs from the backend

  // Terms Agreement
  termsAgreed: boolean;

  // Associated Mandate
  mandateId: string | null;
};

type DealSubmissionData = {
  form: DealSubmissionForm;
  mandateCriteria: CriterionDefinition[];
};

type DealSubmissionActions = {
  setForm: (info: Partial<DealSubmissionForm>) => void;
  setCriteriaAnswer: (criterionId: string, value: boolean) => void;
  setCriteriaNote: (criterionId: string, note: string) => void;
  setMandateId: (mandateId: string) => void;
  setMandateCriteria: (criteria: CriterionDefinition[]) => void;
  addAttachment: (fileId: string) => void;
  removeAttachment: (fileId: string) => void;
  addAttachmentId: (attachmentId: string) => void;
  removeAttachmentId: (attachmentId: string) => void;
  resetForm: () => void;
  initializeCriteria: (mandate: PublicMandateDto) => void;
};

type DealSubmissionState = DealSubmissionData & DealSubmissionActions;

// Initial state values
const initialState: DealSubmissionData = {
  form: {
    contactInfo: {
      name: '',
      email: '',
      phone: '',
      type: null,
    },
    criteriaAnswers: {},
    criteriaNotes: {},
    dealDescription: null,
    attachments: [],
    attachmentIds: [],
    termsAgreed: false,
    mandateId: null,
  },
  mandateCriteria: [],
};

// Create the store with persistence
export const useDealSubmissionStore = create<DealSubmissionState>()(
  persist(
    (set, get) => ({
      // Initial state
      ...initialState,
      resetForm: () => set(initialState),
      setForm: (info) => set((state) => ({ form: { ...state.form, ...info } })),
      setCriteriaAnswer: (criterionId, value) =>
        set((state) => ({
          form: {
            ...state.form,
            criteriaAnswers: {
              ...state.form.criteriaAnswers,
              [criterionId]: value,
            },
          },
        })),
      setCriteriaNote: (criterionId, note) =>
        set((state) => ({
          form: {
            ...state.form,
            criteriaNotes: {
              ...state.form.criteriaNotes,
              [criterionId]: note,
            },
          },
        })),
      setMandateId: (mandateId) =>
        set((state) => ({
          form: {
            ...state.form,
            mandateId,
          },
        })),
      setMandateCriteria: (criteria) =>
        set(() => ({
          mandateCriteria: criteria,
        })),
      addAttachment: (fileId) =>
        set((state) => ({
          form: {
            ...state.form,
            attachments: [...state.form.attachments, fileId],
          },
        })),
      removeAttachment: (fileId) =>
        set((state) => ({
          form: {
            ...state.form,
            attachments: state.form.attachments.filter((id) => id !== fileId),
          },
        })),
      addAttachmentId: (attachmentId) =>
        set((state) => ({
          form: {
            ...state.form,
            attachmentIds: [...arr(state.form.attachmentIds), attachmentId],
          },
        })),
      removeAttachmentId: (attachmentId) =>
        set((state) => ({
          form: {
            ...state.form,
            attachmentIds: arr(state.form.attachmentIds).filter((id) => id !== attachmentId),
          },
        })),
      initializeCriteria: (mandate: PublicMandateDto) => {
        const criteria = generateMandateCriteria(mandate);

        // Get current state to use inside this function
        const { form, setForm, setMandateId, setMandateCriteria } = get();

        // Set mandate criteria
        setMandateCriteria(criteria);

        // Set mandate ID if not already set
        if (!form.mandateId) {
          setMandateId(mandate.id);
        }

        // Initialize criteriaAnswers with default values (false)
        const initialAnswers: Record<string, boolean> = {};
        criteria.forEach((criterion) => {
          // Use the path property to properly map to correct IDs
          // Some criterion IDs don't include the section prefix, but the path does
          const criterionId = criterion.path;

          // Only set if not already set
          if (form.criteriaAnswers[criterionId] === undefined) {
            initialAnswers[criterionId] = false;
          }
        });

        if (Object.keys(initialAnswers).length > 0) {
          setForm({
            criteriaAnswers: {
              ...form.criteriaAnswers,
              ...initialAnswers,
            },
          });
        }
      },
    }),
    {
      name: 'deal-submission-storage', // localStorage key
    },
  ),
);

export function mapFormToDealSubmission(
  form: DealSubmissionForm,
  strategy: InvestmentStrategy,
  user: UserDto | null,
) {
  // Map the owners's contact info to DealOwnerDto
  const dealOwner: DealOwnerDto = {
    name: form.contactInfo.name || '',
    email: form.contactInfo.email || user?.email || '',
    phone: toStrOrNull(form.contactInfo.phone || null),
    role: form.contactInfo.type || 'BROKER',
  };

  // Convert criteria answers to proper boolean flags for DealDto
  const deal: DealDto = {
    dealSources: getBooleanCriterion(form, 'dealSources'),
    investmentStrategy: getBooleanCriterion(form, 'investmentStrategy'),
    instrumentType: getBooleanCriterion(form, 'instrumentType'),
    syndicationPreference: getBooleanCriterion(form, 'syndicationPreference'),
    dealBreakers: getBooleanCriterion(form, 'dealBreakers'),
    minimumReturnTarget: getBooleanCriterion(form, 'minimumReturnTarget'),
    sponsorTrackRecord: getBooleanCriterion(form, 'sponsorTrackRecord'),
    geographicalRestrictions: getBooleanCriterion(form, 'geographicalRestrictions'),

    // Section-specific criteria
    realEstate:
      strategy === 'realEstate'
        ? {
            propertyType: getBooleanCriterion(form, 'realEstate.propertyType'),
            riskReturnProfile: getBooleanCriterion(form, 'realEstate.riskReturnProfile'),
            checkSize: getBooleanCriterion(form, 'realEstate.checkSize'),
            geographicalFocus: getBooleanCriterion(form, 'realEstate.geographicalFocus'),
            holdPeriod: getBooleanCriterion(form, 'realEstate.holdPeriod'),
            projectStage: getBooleanCriterion(form, 'realEstate.projectStage'),
          }
        : null,
    privateEquity:
      strategy === 'privateEquity'
        ? {
            preferredStrategy: getBooleanCriterion(form, 'privateEquity.preferredStrategy'),
            industryFocus: getBooleanCriterion(form, 'privateEquity.industryFocus'),
            checkSize: getBooleanCriterion(form, 'privateEquity.checkSize'),
            controlPreference: getBooleanCriterion(form, 'privateEquity.controlPreference'),
            companyStage: getBooleanCriterion(form, 'privateEquity.companyStage'),
          }
        : null,
    trophyAssets:
      strategy === 'trophyAssets'
        ? {
            assetType: getBooleanCriterion(form, 'trophyAssets.assetType'),
            preferredGeography: getBooleanCriterion(form, 'trophyAssets.preferredGeography'),
            taxPreferences: getBooleanCriterion(form, 'trophyAssets.taxPreferences'),
          }
        : null,
    funds:
      strategy === 'funds'
        ? {
            fundType: getBooleanCriterion(form, 'funds.fundType'),
            fundStage: getBooleanCriterion(form, 'funds.fundStage'),
            sectorFocus: getBooleanCriterion(form, 'funds.sectorFocus'),
            checkSize: getBooleanCriterion(form, 'funds.checkSize'),
          }
        : null,
    taxAdvantaged:
      strategy === 'taxAdvantaged'
        ? {
            primaryTaxProgram: getBooleanCriterion(form, 'taxAdvantaged.primaryTaxProgram'),
            preferredStructures: getBooleanCriterion(form, 'taxAdvantaged.preferredStructures'),
            geographicFocus: getBooleanCriterion(form, 'taxAdvantaged.geographicFocus'),
          }
        : null,

    // Notes and additional info
    notes: {
      ...form.criteriaNotes,
    },
    description: form.dealDescription || null,
    status: null, // status will be assigned by the backend (pending)
  };

  return {
    deal: deal,
    dealOwner: dealOwner,
    attachments: arr(form.attachmentIds),
  };
}

// Helper function to get a boolean value from criteriaAnswers
function getBooleanCriterion(form: DealSubmissionForm, criterionId: string): boolean {
  return form.criteriaAnswers[criterionId] || false;
}
