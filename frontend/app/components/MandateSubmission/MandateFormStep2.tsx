import { FormLabel, FormInput, FormRadioGroup, Req } from '~/components/form';
import { useMandateForm } from '~/context/MandateFormContext';

export function MandateFormStep2() {
  const { form, handleInputChange, handleFieldUpdate, investmentStrategyOptions } =
    useMandateForm();
  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Investment Strategy Focus</h2>
        <p className="mt-1 text-sm text-gray-600">
          Select the broad strategy or asset type you're seeking investments in.
        </p>
      </div>

      {/* Investment Strategies (multi-select checkboxes) */}
      <div className={'form-input'}>
        <FormLabel htmlFor="investmentStrategies">
          Which broad strategy (or asset type) are you seeking? <Req />
        </FormLabel>

        <FormRadioGroup
          name="investmentStrategy"
          options={investmentStrategyOptions}
          required
          value={form.investmentStrategy || ''}
          onChange={(value) => handleFieldUpdate('investmentStrategy', value)}
        />

        <p className="mt-2 text-xs text-gray-500">Select a strategy that apply to your mandate.</p>
      </div>

      {/* Other Strategy (conditional) */}
      {form.investmentStrategy === 'other' && (
        <div className={'form-input'}>
          <FormLabel htmlFor="otherStrategy">
            Please specify other strategy <Req />
          </FormLabel>
          <FormInput
            id="otherStrategy"
            value={form.otherStrategy || ''}
            onChange={handleInputChange}
            required
            placeholder="Please specify the strategy"
          />
        </div>
      )}
    </div>
  );
}
