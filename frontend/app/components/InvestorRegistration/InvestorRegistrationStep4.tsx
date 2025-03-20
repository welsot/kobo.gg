import { FormCheckbox, FormRadioGroup } from '~/components/form';

type InvestorRegistrationStep4Props = {
  form: any;
  accreditedOptions: Array<{ value: string; label: string }>;
  handleFieldUpdate: (fieldId: string, value: any) => void;
};

export function InvestorRegistrationStep4({
  form,
  accreditedOptions,
  handleFieldUpdate,
}: InvestorRegistrationStep4Props) {
  const handleCheckboxChange = (id: string) => (checked: boolean) => {
    handleFieldUpdate(id, checked);
  };

  const handleRadioChange = (value: string) => {
    handleFieldUpdate('accreditedInvestorStatus', value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Accredited Investor Status</h2>
        <p className="mt-1 text-sm text-gray-500">Please select your accredited investor status.</p>
      </div>

      <div className={'form-input'}>
        <FormRadioGroup
          name="accreditedStatus"
          options={accreditedOptions}
          required
          value={form.accreditedInvestorStatus || ''}
          onChange={handleRadioChange}
        />
      </div>

      <div className="p-4 bg-gray-100 rounded-md">
        <h3 className="font-medium text-gray-900">Confirmation of Accreditation</h3>
        <p className="mt-1 text-sm text-gray-600">
          By selecting one of the options above, you verify that your chosen accreditation status is
          accurate as of today's date. You also agree to notify Mandates.io (via email at
          dp@mandates.io) if your accreditation status changes at any time in the future.
        </p>
        <div className="mt-3">
          <FormCheckbox
            id="accreditationConfirmation"
            label="I confirm my accreditation status is accurate."
            required
            checked={form.accreditationConfirmation || false}
            onChange={handleCheckboxChange('accreditationConfirmation')}
          />
        </div>
      </div>
    </div>
  );
}
