import { type ChangeEvent, type FormEvent, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { mapFormToMandateDraft, useMandateSubmissionStore } from '~/store/mandateSubmissionStore';
import { alertError, toInt, updateNestedValue } from '~/utils/form';

import { MandateFormStep1 } from './MandateFormStep1';
import { MandateFormStep2 } from './MandateFormStep2';
import { MandateFormStep3 } from './MandateFormStep3';
import { MandateFormStep4 } from './MandateFormStep4';
import { MandateFormStep5 } from './MandateFormStep5';
import type { UserDto } from '~/api/apiSchemas';
import { apiPostMandateDraft, apiPostMandateSave } from '~/api/apiComponents';
import { MandateFormProvider } from '~/context/MandateFormContext';

function updateUrlAfterStepChange(step: number) {
  const nextURL = `/mandate/submit?step=${step}`;
  const nextTitle = 'Mandates.io - Submit Mandate Step ' + step;
  const nextState = { step: step };
  window.history.pushState(nextState, nextTitle, nextURL);
  console.log('Navigating to step', step);
}

type MandateFormContainerProps = {
  user: UserDto;
};

export function MandateFormContainer(props: MandateFormContainerProps) {
  const [searchParams] = useSearchParams();
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

  const { user } = props;

  // Access the mandate submission store
  const { form, setForm, resetForm } = useMandateSubmissionStore();

  const [saving, setSaving] = useState(false);

  const handleFieldUpdate = (fieldId: string, value: any) => {
    const updatedForm = updateNestedValue(form, fieldId, value);
    setForm(updatedForm);
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    handleFieldUpdate(id, value);
  };

  const handleSelectChange = (id: string, value: string | number) => {
    handleFieldUpdate(id, value);
  };

  // Helper function to update nested form fields
  const updateNestedField = (section: string, field: string, value: any) => {
    // Create a new object with the updated field
    let updatedSection: Record<string, any> = {};

    // Get the current section data
    const sectionData = form[section as keyof typeof form];

    // If section data exists, copy all properties
    if (sectionData && typeof sectionData === 'object') {
      Object.entries(sectionData).forEach(([key, val]) => {
        updatedSection[key] = val;
      });
    }

    // Update the specific field
    updatedSection[field] = value;

    // Update the form state
    handleFieldUpdate(section, updatedSection);
  };

  // Helper to handle input change in nested fields
  const handleNestedInputChange =
    (section: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { id, value } = e.target;
      const fieldName = id.split('.')[1]; // Format is "section.fieldName"
      updateNestedField(section, fieldName, value);
    };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (saving) return;

    if (currentStep === 1) {
      // Validation for Step 1
      if (form.dealSources.length === 0) {
        alert('Please select at least one deal source.');
        return;
      }
    } else if (currentStep === 2) {
      // Validation for Step 2
      if (!form.investmentStrategy) {
        alert('Please select an investment strategy.');
        return;
      }
    } else if (currentStep === 5) {
      if (!form.termsAgreed) {
        alert('Please agree to the terms.');
        return;
      }
    }

    if (currentStep === totalSteps) {
      setSaving(true);

      apiPostMandateSave({
        body: {
          draft: mapFormToMandateDraft(form, user),
          step: currentStep,
        },
      })
        .then((res) => {
          resetForm();
          navigate('/mandate/success?mandateId=' + res.mandateId);
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
      setSaving(true);

      const draft = mapFormToMandateDraft(form, user);

      apiPostMandateDraft({
        body: {
          step: currentStep,
          draft: draft,
        },
      })
        .then(() => {
          // Success handling
        })
        .catch((err) => {
          console.error(err);
          setStep(currentStep); // rollback optimistic UI
          alertError(err);
        })
        .finally(() => {
          setSaving(false);
        });
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setStep(prevStep);
    }
  };

  const showFinalLoading = saving && currentStep === totalSteps;

  // Create the context value to provide to all form components
  const contextValue = {
    form,
    handleInputChange,
    handleSelectChange,
    handleFieldUpdate,
    updateNestedField,
    handleNestedInputChange,
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-white">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Submit a Mandate</h1>
        <p className="mt-2 text-lg text-gray-600">
          Submit your investment mandate to connect with qualified deal opportunities that match
          your investment criteria.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`w-1/${totalSteps} text-center ${currentStep > index ? 'text-blue-600' : 'text-gray-400'}`}
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
        <MandateFormProvider value={contextValue}>
          <form onSubmit={handleSubmit} className="space-y-8 bg-white">
            {/* Step 1: Who Can Submit Deals */}
            {currentStep === 1 && <MandateFormStep1 />}

            {/* Step 2: Investment Strategy Focus */}
            {currentStep === 2 && <MandateFormStep2 />}

            {/* Step 3: Strategy-Specific Details */}
            {currentStep === 3 && <MandateFormStep3 />}

            {/* Step 5: Exclusions & Hurdles */}
            {currentStep === 4 && <MandateFormStep4 />}

            {/* Step 6: Contact Info and Terms */}
            {currentStep === 5 && <MandateFormStep5 userEmail={user.email} />}

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
                {currentStep === totalSteps ? 'Submit Mandate' : 'Continue'}
              </button>
            </div>
          </form>
        </MandateFormProvider>
      )}
    </div>
  );
}

function FinalLoading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex space-x-4">
        <div className="w-8 h-8 border-t-2 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    </div>
  );
}
