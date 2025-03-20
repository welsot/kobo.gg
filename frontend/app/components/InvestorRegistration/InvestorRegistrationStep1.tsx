import { FormInput, FormLabel, FormSelect, Req } from '~/components/form';
import type {
  HandleInputChangeType,
  HandleSelectChangeType,
} from '~/components/InvestorRegistration/RegistrationFormContainer';

type InvestorRegistrationStep1Props = {
  form: any;
  handleInputChange: HandleInputChangeType;
  handleSelectChange: HandleSelectChangeType;
  basicInfoSubmitted: boolean;
  userEmail?: string;
  countryOptions: Array<{ value: string; label: string }>;
  referralSources: Array<{ value: string; label: string }>;
};

export function InvestorRegistrationStep1({
  form,
  handleInputChange,
  handleSelectChange,
  basicInfoSubmitted,
  userEmail,
  countryOptions,
  referralSources,
}: InvestorRegistrationStep1Props) {
  return (
    <div className="space-y-6">
      <div className={'form-input'}>
        <FormLabel htmlFor="email">
          Email <Req />
        </FormLabel>
        <FormInput
          id="email"
          type="email"
          placeholder="you@example.com"
          required
          value={form.email || userEmail || ''}
          onChange={handleInputChange}
          readonly={basicInfoSubmitted || !!userEmail}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={'form-input'}>
          <FormLabel htmlFor="fullName.firstName">
            First Name <Req />
          </FormLabel>
          <FormInput
            id="fullName.firstName"
            placeholder="John"
            required
            value={form.fullName.firstName}
            onChange={handleInputChange}
          />
        </div>
        <div className={'form-input'}>
          <FormLabel htmlFor="fullName.lastName">
            Last Name <Req />
          </FormLabel>
          <FormInput
            id="fullName.lastName"
            placeholder="Doe"
            required
            value={form.fullName.lastName}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className={'form-input'}>
        <FormLabel htmlFor="countryOfResidence">
          Country of Residence <Req />
        </FormLabel>
        <FormSelect
          id="countryOfResidence"
          options={countryOptions}
          required
          value={form.countryOfResidence?.toString()}
          onChange={(value) => handleSelectChange('countryOfResidence', parseInt(value, 10))}
        />
      </div>

      <div className={'form-input'}>
        <FormLabel htmlFor="stateOfResidence">
          State of Residence <Req />
        </FormLabel>
        <FormInput
          id="stateOfResidence"
          placeholder="California"
          required
          value={form.stateOfResidence || ''}
          onChange={handleInputChange}
        />
      </div>

      <div className={'form-input'}>
        <FormLabel htmlFor="referralSource">
          How did you find out about Mandates.io? <Req />
        </FormLabel>
        <FormSelect
          id="referralSource"
          options={referralSources}
          required={true}
          value={form.referralSource || ''}
          onChange={(value) => handleSelectChange('referralSource', value)}
        />
      </div>
    </div>
  );
}
