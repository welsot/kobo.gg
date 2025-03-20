import type { MandateSubmissionForm } from '~/store/mandateSubmissionStore';
import { FormInput, FormLabel, FormSelect, Req } from '~/components/form';
import { useMandateForm } from '~/context/MandateFormContext';

export function MandateFormStep3FundsSection() {
  const {
    form,
    handleNestedInputChange,
    fundTypeOptions,
    fundStageOptions,
    fundSectorFocusOptions,
    fundCheckSizeOptions,
    updateNestedField,
  } = useMandateForm();

  // Create a wrapper for handleSelectChange to work with FormSelect component
  const handleSelectChange = (id: string, value: string) => {
    updateNestedField('funds', id, value);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-6">
      <h3 className="text-lg font-medium text-gray-800">Funds</h3>

      {/* Fund Type */}
      <div className={'form-input'}>
        <FormLabel htmlFor="funds.fundType">
          Fund Type <Req />
        </FormLabel>
        <FormSelect
          id="funds.fundType"
          options={fundTypeOptions}
          required
          value={form.funds?.fundType || ''}
          onChange={(value) => handleSelectChange('fundType', value)}
        />
      </div>

      {/* Other Fund Type (conditional) */}
      {form.funds?.fundType === 'other' && (
        <div className={'form-input'}>
          <FormLabel htmlFor="funds.otherFundType">
            Please specify fund type <Req />
          </FormLabel>
          <FormInput
            id="funds.otherFundType"
            value={form.funds?.otherFundType || ''}
            onChange={handleNestedInputChange('funds')}
            required
            placeholder="Please specify"
          />
        </div>
      )}

      {/* Fund Stage */}
      <div className={'form-input'}>
        <FormLabel htmlFor="funds.fundStage">
          Fund Stage <Req />
        </FormLabel>
        <FormSelect
          id="funds.fundStage"
          options={fundStageOptions}
          required
          value={form.funds?.fundStage || ''}
          onChange={(value) => handleSelectChange('fundStage', value)}
        />
      </div>

      {/* Sector Focus */}
      <div className={'form-input'}>
        <FormLabel htmlFor="funds.sectorFocus">
          Sector Focus <Req />
        </FormLabel>
        <FormSelect
          id="funds.sectorFocus"
          options={fundSectorFocusOptions}
          required
          value={form.funds?.sectorFocus || ''}
          onChange={(value) => handleSelectChange('sectorFocus', value)}
        />
      </div>

      {/* Other Sector (conditional) */}
      {form.funds?.sectorFocus === 'other' && (
        <div className={'form-input'}>
          <FormLabel htmlFor="funds.otherSector">
            Please specify sector <Req />
          </FormLabel>
          <FormInput
            id="funds.otherSector"
            value={form.funds?.otherSector || ''}
            onChange={handleNestedInputChange('funds')}
            required
            placeholder="Please specify"
          />
        </div>
      )}

      {/* Check Size */}
      <div className={'form-input'}>
        <FormLabel htmlFor="funds.checkSize">
          Check Size <Req />
        </FormLabel>
        <FormSelect
          id="funds.checkSize"
          options={fundCheckSizeOptions}
          required
          value={form.funds?.checkSize || ''}
          onChange={(value) => handleSelectChange('checkSize', value)}
        />
      </div>
    </div>
  );
}
