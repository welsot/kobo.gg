import { FormInput, FormLabel, FormSelect, Req } from '~/components/form';
import { useMandateForm } from '~/context/MandateFormContext';

export function MandateFormStep3PrivateEquitySection() {
  const {
    form,
    handleNestedInputChange,
    privateEquityStrategyOptions,
    privateEquityIndustryOptions,
    privateEquityCheckSizeOptions,
    privateEquityControlOptions,
    privateEquityCompanyStageOptions,
    updateNestedField,
  } = useMandateForm();

  const handleSelectChange = (fieldName: string, value: string) => {
    updateNestedField('privateEquity', fieldName, value);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-6">
      <h3 className="text-lg font-medium text-gray-800">Private Equity</h3>

      {/* Preferred Strategy */}
      <div className={'form-input'}>
        <FormLabel htmlFor="privateEquity.preferredStrategy">
          Preferred Strategy <Req />
        </FormLabel>
        <FormSelect
          id="privateEquity.preferredStrategy"
          options={privateEquityStrategyOptions}
          required
          value={form.privateEquity?.preferredStrategy || ''}
          onChange={(value) => handleSelectChange('preferredStrategy', value)}
        />
      </div>

      {/* Other Strategy (conditional) */}
      {form.privateEquity?.preferredStrategy === 'other' && (
        <div className={'form-input'}>
          <FormLabel htmlFor="privateEquity.otherStrategy">
            Please specify strategy <Req />
          </FormLabel>
          <FormInput
            id="privateEquity.otherStrategy"
            type="text"
            placeholder="Please specify"
            required
            value={form.privateEquity?.otherStrategy || ''}
            onChange={handleNestedInputChange('privateEquity')}
          />
        </div>
      )}

      {/* Industry Focus */}
      <div className={'form-input'}>
        <FormLabel htmlFor="privateEquity.industryFocus">
          Industry Focus <Req />
        </FormLabel>
        <FormSelect
          id="privateEquity.industryFocus"
          options={privateEquityIndustryOptions}
          required
          value={form.privateEquity?.industryFocus || ''}
          onChange={(value) => handleSelectChange('industryFocus', value)}
        />
      </div>

      {/* Other Industry (conditional) */}
      {form.privateEquity?.industryFocus === 'other' && (
        <div className={'form-input'}>
          <FormLabel htmlFor="privateEquity.otherIndustry">
            Please specify industry <Req />
          </FormLabel>
          <FormInput
            id="privateEquity.otherIndustry"
            type="text"
            placeholder="Please specify"
            required
            value={form.privateEquity?.otherIndustry || ''}
            onChange={handleNestedInputChange('privateEquity')}
          />
        </div>
      )}

      {/* Check Size */}
      <div className={'form-input'}>
        <FormLabel htmlFor="privateEquity.checkSize">
          Check Size <Req />
        </FormLabel>
        <FormSelect
          id="privateEquity.checkSize"
          options={privateEquityCheckSizeOptions}
          required
          value={form.privateEquity?.checkSize || ''}
          onChange={(value) => handleSelectChange('checkSize', value)}
        />
      </div>

      {/* Control Preference */}
      <div className={'form-input'}>
        <FormLabel htmlFor="privateEquity.controlPreference">
          Control Preference <Req />
        </FormLabel>
        <FormSelect
          id="privateEquity.controlPreference"
          options={privateEquityControlOptions}
          required
          value={form.privateEquity?.controlPreference || ''}
          onChange={(value) => handleSelectChange('controlPreference', value)}
        />
      </div>

      {/* Company Stage */}
      <div className={'form-input'}>
        <FormLabel htmlFor="privateEquity.companyStage">
          Company Stage <Req />
        </FormLabel>
        <FormSelect
          id="privateEquity.companyStage"
          options={privateEquityCompanyStageOptions}
          required
          value={form.privateEquity?.companyStage || ''}
          onChange={(value) => handleSelectChange('companyStage', value)}
        />
      </div>
    </div>
  );
}
