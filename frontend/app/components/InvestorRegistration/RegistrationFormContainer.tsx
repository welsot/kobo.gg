import { type ChangeEvent, type FormEvent, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useInvestorRegistrationStore } from '~/store/investorRegistrationStore';
import { useCurrentUser } from '~/context/UserContext';
import {
  apiPostInvestorDraft,
  apiPostInvestorRegistration,
  apiPostInvestorVerification,
} from '~/api/apiComponents';
import { authService } from '~/utils/authService';
import { alertError, toInt, updateNestedValue } from '~/utils/form';
import type {
  CountryDto,
  InvestorProfileDraftDto,
  InvestorRegistrationRequest,
  SaveInvestorProfileDraftRequest,
  UserDto,
} from '~/api/apiSchemas';
import { InvestorRegistrationStep1 } from './InvestorRegistrationStep1';
import { InvestorRegistrationStep2 } from './InvestorRegistrationStep2';
import { InvestorRegistrationStep3 } from './InvestorRegistrationStep3';
import { InvestorRegistrationStep4 } from './InvestorRegistrationStep4';
import { InvestorRegistrationStep5 } from './InvestorRegistrationStep5';
import {
  accreditedOptions,
  dealExperienceOptions,
  deployedAmountOptions,
  futureDeploymentOptions,
  investorTypes,
  netWorthOptions,
  referralSources,
} from '~/utils/investor';

function updateUrlAfterStepChange(step: number) {
  const nextURL = `/investor/register?step=${step}`;
  const nextTitle = 'Mandates.io - Investor Registration Step ' + step;
  const nextState = { step: step };
  window.history.pushState(nextState, nextTitle, nextURL);
  console.log('Navigating to step', step);
}

type RegistrationFormContainerProps = {
  countries: CountryDto[];
};

export type HandleSelectChangeType = (id: string, value: string | number) => void;

export type HandleInputChangeType = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;

export function RegistrationFormContainer(props: RegistrationFormContainerProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const stepParam = searchParams.get('step');
  const initialStep = toInt(stepParam, 1);

  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(
    initialStep > 0 && initialStep <= 5 ? initialStep : 1,
  );
  const totalSteps = 5;

  const setStep = (step: number) => {
    setCurrentStep(step);
    updateUrlAfterStepChange(step);
  };

  const { countries } = props;

  const { user, setUser } = useCurrentUser();

  // Access the investor registration store
  const { form, setForm, basicInfoSubmitted, setBasicInfoSubmitted, resetForm } =
    useInvestorRegistrationStore();

  const [saving, setSaving] = useState(false);

  const handleFieldUpdate = (fieldId: string, value: any) => {
    const updatedForm = updateNestedValue(form, fieldId, value);
    setForm(updatedForm);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    handleFieldUpdate(id, value);
  };

  const handleSelectChange = (id: string, value: string | number) => {
    handleFieldUpdate(id, value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (saving) return;

    const isFirstStep = currentStep === 1;

    if (currentStep === 3) {
      if (!form.acceptedLegalAcknowledgement) {
        alert('You must accept the legal acknowledgement to continue.');
        return;
      }

      if (!form.acceptedRiskAcknowledgement) {
        alert('You must accept the risk acknowledgement to continue.');
        return;
      }

      if (!form.acceptedNoAlternativeUse) {
        alert('You must accept the no alternative use acknowledgement to continue.');
        return;
      }
    }

    if (currentStep === 4) {
      if (
        !form.accreditationConfirmation &&
        form.accreditedInvestorStatus &&
        form.accreditedInvestorStatus !== 'NON_ACCREDITED'
      ) {
        alert('You must confirm your accreditation status to continue.');
        return;
      }
    }

    const draft: InvestorProfileDraftDto = {
      fullName: {
        firstName: form.fullName.firstName,
        lastName: form.fullName.lastName,
      },
      countryOfResidence: toInt(form.countryOfResidence),
      stateOfResidence: form.stateOfResidence,
      referralSource: form.referralSource,
      phoneNumber: form.phoneNumber,
      linkedinUrl: form.linkedinUrl,
      investorType: form.investorType,
      accreditedInvestorStatus: form.accreditedInvestorStatus,
      lpInvestingExperience: form.lpInvestingExperience,
      deployedAmount: form.deployedAmount,
      expectedDeploymentAmount: form.expectedDeploymentAmount,
      netWorth: form.netWorth,
      acceptedAnonymousDistribution: form.acceptedAnonymousDistribution,
      acceptedLegalAcknowledgement: form.acceptedLegalAcknowledgement, // todo this is not part of the form, delete?
      acceptedNoAlternativeUse: form.acceptedNoAlternativeUse,
      acceptedRiskAcknowledgement: form.acceptedRiskAcknowledgement,
      accreditationConfirmation: form.accreditationConfirmation,
    };

    if (currentStep === totalSteps) {
      // handle final step submission
      setSaving(true);

      apiPostInvestorVerification({ body: { draft: draft, step: currentStep } })
        .then((res) => {
          resetForm();

          if (user) {
            const updatedUser: UserDto = { ...user, investorProfile: res.profile };
            setUser(updatedUser);
          }

          navigate('/investor/register/success');
        })
        .catch((err) => {
          console.error(err);
          alertError(err);
        })
        .finally(() => {
          setSaving(false);
        });
    } else {
      const nextStep = currentStep + 1;
      setStep(nextStep); // optimistic UI

      if (isFirstStep && !basicInfoSubmitted) {
        setSaving(true);
        const investorRegistrationBody: InvestorRegistrationRequest = {
          email: form.email,
          basicInfo: {
            name: {
              firstName: form.fullName.firstName,
              lastName: form.fullName.lastName,
            },
            countryId: toInt(form.countryOfResidence),
            stateOfResidence: form.stateOfResidence,
            referralSource: form.referralSource || 'Other',
          },
        };
        apiPostInvestorRegistration({
          body: investorRegistrationBody,
        })
          .then((res) => {
            authService.setApiToken(res.apiToken);
            setBasicInfoSubmitted(true);
            setUser(res.user);
          })
          .catch((err) => {
            console.error(err);
            alertError(err);
            setStep(currentStep); // rollback optimistic UI
          })
          .finally(() => {
            setSaving(false);
          });
      } else {
        const reqData: SaveInvestorProfileDraftRequest = {
          step: currentStep,
          draft: draft,
        };
        apiPostInvestorDraft({ body: reqData })
          .then((res) => {
            // todo handle response
          })
          .catch((err) => {
            console.error(err);
            alertError(err);
            setStep(currentStep); // rollback optimistic UI
          })
          .finally(() => {
            setSaving(false);
          });
      }
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setStep(prevStep);
    }
  };

  // Country options from props, transform to expected format
  const countryOptions = countries.map((country) => ({
    value: country.id.toString(),
    label: country.country,
  }));

  const showFinalLoading = saving && currentStep === totalSteps;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-white">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Mandates.io Registration</h1>
        <p className="mt-2 text-lg text-gray-600">
          Deal sponsors can submit their opportunities, and matched Family Offices will receive
          email notifications shortly after. For any common questions, please see our FAQ.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`w-1/5 text-center ${currentStep > index ? 'text-blue-600' : 'text-gray-400'}`}
            >
              Step {index + 1}
            </div>
          ))}
        </div>
        <div className="overflow-hidden h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-blue-600 rounded-full"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {showFinalLoading ? (
        <FinalLoading />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white">
          {/* Step 1: Basic Registration */}
          {currentStep === 1 && (
            <InvestorRegistrationStep1
              form={form}
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange}
              basicInfoSubmitted={basicInfoSubmitted}
              userEmail={user?.email}
              countryOptions={countryOptions}
              referralSources={referralSources}
            />
          )}

          {/* Step 2: Verification */}
          {currentStep === 2 && (
            <InvestorRegistrationStep2
              form={form}
              handleFieldUpdate={handleFieldUpdate}
              investorTypes={investorTypes}
            />
          )}

          {/* Step 3: Terms and Acknowledgements */}
          {currentStep === 3 && (
            <InvestorRegistrationStep3 form={form} handleFieldUpdate={handleFieldUpdate} />
          )}

          {/* Step 4: Accreditation */}
          {currentStep === 4 && (
            <InvestorRegistrationStep4
              form={form}
              accreditedOptions={accreditedOptions}
              handleFieldUpdate={handleFieldUpdate}
            />
          )}

          {/* Step 5: Investment Experience */}
          {currentStep === 5 && (
            <InvestorRegistrationStep5
              form={form}
              dealExperienceOptions={dealExperienceOptions}
              deployedAmountOptions={deployedAmountOptions}
              futureDeploymentOptions={futureDeploymentOptions}
              netWorthOptions={netWorthOptions}
              handleFieldUpdate={handleFieldUpdate}
            />
          )}

          <div className="flex justify-between pt-6">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={goBack}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back
              </button>
            ) : (
              <div></div>
            )}
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {currentStep === totalSteps ? 'Submit Registration' : 'Continue'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function FinalLoading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex space-x-4">
        <div className="w-8 h-8 border-t-2 border-b-2 border-blue-600 rounded-full animate-spin"></div>
        <div className="w-8 h-8 border-t-2 border-b-2 border-blue-600 rounded-full animate-spin"></div>
        <div className="w-8 h-8 border-t-2 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    </div>
  );
}
