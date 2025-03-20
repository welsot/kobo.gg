import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { mapFormToDealSubmission, useDealSubmissionStore } from '~/store/dealSubmissionStore';
import { alertError, updateNestedValue } from '~/utils/form';

import { DealFormStep1 } from './DealFormStep1';
import { DealFormStep2 } from './DealFormStep2';
import { DealFormStep3 } from './DealFormStep3';
import { DealFormStep4 } from './DealFormStep4';
import { DealSubmissionProvider } from '~/context/DealSubmissionContext';
import type { PublicMandateDto } from '~/api/apiSchemas';
import { useCurrentUser } from '~/context/UserContext';
import { apiPostDealOwnerRegistration, apiPostDealSave } from '~/api/apiComponents';
import { authService } from '~/utils/authService';
import type { InvestmentStrategy } from '~/utils/mandate';

type DealFormContainerProps = {
  mandate: PublicMandateDto;
};

export function DealFormContainer({ mandate }: DealFormContainerProps) {
  const navigate = useNavigate();

  const { user, setUser } = useCurrentUser();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Access the deal submission store
  const {
    form,
    setForm,
    resetForm,
    setCriteriaAnswer,
    setCriteriaNote,
    mandateCriteria,
    initializeCriteria,
  } = useDealSubmissionStore();

  const [saving, setSaving] = useState(false);

  // Initialize criteria when the component mounts
  useEffect(() => {
    // Initialize criteria with the mandate data
    initializeCriteria(mandate);
  }, [mandate, initializeCriteria]);

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

  const handleCriteriaAnswer = (criterionId: string, value: boolean) => {
    setCriteriaAnswer(criterionId, value);
  };

  const handleCriteriaNote = (criterionId: string, note: string) => {
    setCriteriaNote(criterionId, note);
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
      const dealOwnerEmail = form.contactInfo.email || user?.email;
      if (!form.contactInfo.name || !dealOwnerEmail || !form.contactInfo.type) {
        alert('Please fill in all required contact information.');
        console.log('validated:', form.contactInfo.name, dealOwnerEmail, form.contactInfo.type);
        return;
      }
    } else if (currentStep === 2) {
      // Step 2 validation - all criteria fields are optional
      // Just proceed to the next step
    } else if (currentStep === 3) {
      // Validation for Step 3
      if (!form.dealDescription) {
        alert('Please provide a deal description.');
        return;
      }
    } else if (currentStep === 4) {
      if (!form.termsAgreed) {
        alert('Please agree to the terms.');
        return;
      }
    }

    if (currentStep === totalSteps) {
      setSaving(true);

      try {
        const strategy: InvestmentStrategy = mandate.investmentStrategy
          ? (mandate.investmentStrategy as InvestmentStrategy)
          : 'other';
        // Map form data to DealDto and DealOwnerDto
        const dealSubmissionData = mapFormToDealSubmission(form, strategy, user);

        // Submit the deal using the API
        apiPostDealSave({
          body: {
            mandateId: mandate.id,
            deal: dealSubmissionData.deal,
            dealOwner: dealSubmissionData.dealOwner,
            attachments: dealSubmissionData.attachments,
          },
        })
          .then((res) => {
            if (res.apiToken) {
              authService.setApiToken(res.apiToken);
              setUser(res.user);
            }

            // Reset form and navigate to success page on success
            resetForm();
            navigate(`/mandates/${mandate.id}/submit-deal/success?dealId=${res.id}`);
          })
          .catch((error) => {
            console.error('Error submitting deal:', error);
            alertError(error);
          })
          .finally(() => {
            setSaving(false);
          });
      } catch (err) {
        console.error('Error preparing deal submission:', err);
        alertError(err);
        setSaving(false);
      }
    } else {
      // Move to the next step
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);

      if (!user) {
        // try to register
        apiPostDealOwnerRegistration({
          body: {
            name: form.contactInfo.name,
            email: form.contactInfo.email,
          },
        })
          .then((res) => {
            authService.setApiToken(res.apiToken);
            setUser(res.user);
          })
          .catch((err) => {
            setCurrentStep(currentStep);
            console.error('Error Registering Deal Owner:', err);
            alertError(err);
          });
      }
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
    }
  };

  const showFinalLoading = saving && currentStep === totalSteps;

  // Create the context value to provide to all form components
  const contextValue = {
    form,
    handleInputChange,
    handleSelectChange,
    handleFieldUpdate,
    handleCriteriaAnswer,
    handleCriteriaNote,
    updateNestedField,
    handleNestedInputChange,
    mandateCriteria,
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-white">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Submit a Deal</h1>
        <p className="mt-2 text-lg text-gray-600">
          Submit your deal for this mandate. Ensure it meets the investment criteria for the best
          chance of success.
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
        <DealSubmissionProvider value={contextValue}>
          <form onSubmit={handleSubmit} className="space-y-8 bg-white">
            {/* Step 1: Deal Owner Info */}
            {currentStep === 1 && <DealFormStep1 />}

            {/* Step 2: Mandate Criteria Answers */}
            {currentStep === 2 && <DealFormStep2 />}

            {/* Step 3: Deal Description */}
            {currentStep === 3 && <DealFormStep3 />}

            {/* Step 4: Attachments & Submit */}
            {currentStep === 4 && <DealFormStep4 />}

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
                {currentStep === totalSteps ? 'Submit Deal' : 'Continue'}
              </button>
            </div>
          </form>
        </DealSubmissionProvider>
      )}
    </div>
  );
}

function FinalLoading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-8 h-8 border-t-2 border-b-2 border-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-600">Submitting your deal...</p>
      </div>
    </div>
  );
}
