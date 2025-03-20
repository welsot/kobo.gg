import { FormLabel, FormRadioGroup, Req } from '~/components/form';

type InvestorRegistrationStep5Props = {
  form: any;
  dealExperienceOptions: Array<{ value: string; label: string }>;
  deployedAmountOptions: Array<{ value: string; label: string }>;
  futureDeploymentOptions: Array<{ value: string; label: string }>;
  netWorthOptions: Array<{ value: string; label: string }>;
  handleFieldUpdate: (fieldId: string, value: any) => void;
};

export function InvestorRegistrationStep5({
  form,
  dealExperienceOptions,
  deployedAmountOptions,
  futureDeploymentOptions,
  netWorthOptions,
  handleFieldUpdate,
}: InvestorRegistrationStep5Props) {
  const handleRadioChange = (field: string) => (value: string) => {
    handleFieldUpdate(field, value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">LP Investing Experience</h2>
      </div>

      <div className={'form-input'}>
        <FormLabel htmlFor="lpInvestingExperience" required>
          How many LP deals have you invested in?
        </FormLabel>
        <FormRadioGroup
          name="lpInvestingExperience"
          options={dealExperienceOptions}
          required
          value={form.lpInvestingExperience || ''}
          onChange={handleRadioChange('lpInvestingExperience')}
        />
      </div>

      <div className={'form-input'}>
        <FormLabel htmlFor="deployedAmount" required>
          Approximately how much have you deployed into LP investments?
        </FormLabel>
        <FormRadioGroup
          name="deployedAmount"
          options={deployedAmountOptions}
          required
          value={form.deployedAmount || ''}
          onChange={handleRadioChange('deployedAmount')}
        />
      </div>

      <div className={'form-input'}>
        <FormLabel htmlFor="expectedDeploymentAmount" required>
          How much do you expect to deploy over the next 5 years into LP investments?
        </FormLabel>
        <FormRadioGroup
          name="expectedDeploymentAmount"
          options={futureDeploymentOptions}
          required
          value={form.expectedDeploymentAmount || ''}
          onChange={handleRadioChange('expectedDeploymentAmount')}
        />
      </div>

      <div className={'form-input'}>
        <FormLabel htmlFor="netWorth">
          Net Worth <Req />
        </FormLabel>
        <FormRadioGroup
          name="netWorth"
          options={netWorthOptions}
          required
          value={form.netWorth || ''}
          onChange={handleRadioChange('netWorth')}
        />
      </div>

      <div className="p-4 bg-gray-100 rounded-md">
        <h3 className="font-medium text-gray-900">Success!</h3>
        <p className="mt-1 text-sm text-gray-600">
          You've completed the registration form. Click submit below to create your account and
          proceed to creating a mandate.
        </p>
      </div>
    </div>
  );
}
