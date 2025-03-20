import { type ChangeEvent } from 'react';
import { FormInput, FormLabel, FormRadioGroup, Req } from '~/components/form';

type InvestorRegistrationStep2Props = {
  form: any;
  handleFieldUpdate: (fieldId: string, value: any) => void;
  investorTypes: Array<{ value: string; label: string }>;
};

export function InvestorRegistrationStep2({
  form,
  handleFieldUpdate,
  investorTypes,
}: InvestorRegistrationStep2Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Help Us Verify You Faster</h2>
        <p className="mt-1 text-sm text-gray-500">
          We're currently behind on verifying new users. Providing the following details can
          expedite your onboarding process—otherwise, you may experience a delay of up to a month
          before we can verify you. If you don't have a LinkedIn profile, please send an email with
          a brief introduction about yourself to dp@mandates.io.
        </p>
      </div>

      <div className={'form-input'}>
        <FormLabel htmlFor="phone">Cell (Optional)</FormLabel>
        <p className="text-sm text-gray-500 mb-1">
          Including a cell will expedite onboarding verification.
        </p>
        <FormInput
          id="phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={form.phoneNumber || ''}
          onChange={(e) => {
            handleFieldUpdate('phoneNumber', e.target.value);
          }}
        />
        <p className="mt-1 text-xs text-gray-500">
          By continuing, I agree to receive a verification code at this phone number.
        </p>
      </div>

      <div className={'form-input'}>
        <FormLabel htmlFor="linkedIn">LinkedIn Profile Link (Optional)</FormLabel>
        <p className="text-sm text-gray-500 mb-1">
          Providing a LinkedIn URL also helps us verify your background more quickly.
        </p>
        <FormInput
          id="linkedIn"
          type="url"
          placeholder="e.g., https://www.linkedin.com/in/yourprofile"
          value={form.linkedinUrl || ''}
          onChange={(e) => {
            handleFieldUpdate('linkedinUrl', e.target.value);
          }}
        />
      </div>

      <div className={'form-input'}>
        <FormLabel htmlFor="investorType">
          How would you classify yourself? <Req />
        </FormLabel>
        <FormRadioGroup
          name="investorType"
          options={investorTypes}
          required
          value={form.investorType || ''}
          onChange={(value) => handleFieldUpdate('investorType', value)}
        />
      </div>
    </div>
  );
}
