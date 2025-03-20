import { FormLabel, FormInput, FormCheckbox, FormTextarea, Req } from '~/components/form';
import { useCurrentUser } from '~/context/UserContext';
import { useMandateForm } from '~/context/MandateFormContext';
import { Link } from 'react-router';

type MandateFormStep6Props = {
  userEmail?: string;
};

export function MandateFormStep5({ userEmail }: MandateFormStep6Props) {
  const { form, handleInputChange, handleFieldUpdate } = useMandateForm();
  const handleCheckboxChange = (checked: boolean) => {
    handleFieldUpdate('termsAgreed', checked);
  };

  const { user } = useCurrentUser();
  const investorProfile = user?.investorProfile;
  const fullName = investorProfile
    ? `${investorProfile.fullName.firstName} ${investorProfile.fullName.lastName}`
    : '';
  const cell = investorProfile?.phoneNumber || '';

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">
          Additional Details & Contact Information
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Provide any additional details and your contact information.
        </p>
      </div>

      {/* Additional Details */}
      <div className={'form-input'}>
        <FormLabel htmlFor="additionalDetails">Additional Details</FormLabel>
        <div className="mt-1">
          <FormTextarea
            id="additionalDetails"
            value={form.additionalDetails || ''}
            onChange={handleInputChange}
            rows={4}
            placeholder="Please share any other specifics (co-investment requirements, timeline expectations, governance preferences, etc.) that we may have missed."
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Share any additional details that weren't covered in the previous sections.
        </p>
      </div>

      {/* Contact Info */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Contact Information</h3>

        <div className="space-y-4">
          {/* Contact Name */}
          <div className={'form-input'}>
            <FormLabel htmlFor="contactInfo.name">
              Full Name <Req />
            </FormLabel>
            <FormInput
              id="contactInfo.name"
              value={form.contactInfo.name || fullName || ''}
              onChange={handleInputChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          {/* Contact Email */}
          <div className={'form-input'}>
            <FormLabel htmlFor="contactInfo.email">
              Email Address <Req />
            </FormLabel>
            <FormInput
              id="contactInfo.email"
              type="email"
              value={form.contactInfo.email || userEmail || ''}
              onChange={handleInputChange}
              required
              placeholder="Enter your email address"
              disabled={!!userEmail}
            />
            {userEmail && (
              <p className="mt-1 text-xs text-gray-500">Using email from your account.</p>
            )}
          </div>

          {/* Contact Phone */}
          <div className={'form-input'}>
            <FormLabel htmlFor="contactInfo.phone">Phone Number</FormLabel>
            <FormInput
              id="contactInfo.phone"
              type="tel"
              value={form.contactInfo.phone || ''}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
            />
          </div>
        </div>
      </div>

      {/* Terms and Agreement */}
      <div className="pt-4">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Terms and Agreement</h3>

        <div className="rounded-md bg-gray-50 p-4 border border-gray-200">
          <FormCheckbox
            id="termsAgreed"
            checked={form.termsAgreed}
            onChange={handleCheckboxChange}
            required
            label={
              <div>
                <span className="font-medium">
                  I agree to the terms and conditions <Req />
                </span>
                <p className="text-gray-500 mt-1">
                  By submitting this mandate, I confirm that all information provided is accurate
                  and truthful. I understand that Mandates.io will use this information to match our
                  mandate with potential investment opportunities. I agree to the{' '}
                  <Link to="/terms" className="text-blue-600 hover:text-blue-800">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-800">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            }
          />
        </div>

        <div className="mt-4 text-sm text-gray-600 p-4 border border-gray-200 rounded-md">
          <h4 className="font-semibold mb-2">Anonymous Distribution Notice</h4>
          <p>
            By submitting this mandate, you authorize Mandates.io and its affiliates to share
            non-identifying details of your mandate (e.g., industry focus, desired investment size)
            across social media platforms (such as LinkedIn) and investor networks for matching and
            deal-sourcing purposes. Your personal identity and any confidential information will not
            be disclosed without your explicit permission.
          </p>
        </div>
      </div>
    </div>
  );
}
