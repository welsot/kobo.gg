import { FormLabel, FormCheckbox, Req } from '~/components/form';
import { useMandateForm } from '~/context/MandateFormContext';

export function MandateFormStep1() {
  const { form, handleFieldUpdate, dealSourceOptions } = useMandateForm();
  const handleCheckboxChange = (value: string) => (checked: boolean) => {
    // Update the array based on checkbox state
    let updatedDealSources = [...form.dealSources];

    if (checked) {
      // Add the value to the array if not already present
      if (!updatedDealSources.includes(value)) {
        updatedDealSources.push(value);
      }
    } else {
      // Remove the value from the array
      updatedDealSources = updatedDealSources.filter((source) => source !== value);
    }

    handleFieldUpdate('dealSources', updatedDealSources);
  };

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Who Can Submit Deals?</h2>
        <p className="mt-1 text-sm text-gray-600">
          Specify which sources are acceptable for new deals.
        </p>
      </div>

      {/* Deal Sources (multi-select checkboxes) */}
      <div className={'form-input'}>
        <FormLabel htmlFor="dealSources">
          Which sources are acceptable for new deals? <Req />
        </FormLabel>
        <div className="mt-4 space-y-3">
          {dealSourceOptions.map((option) => (
            <FormCheckbox
              key={option.value}
              id={`dealSource-${option.value}`}
              label={option.label}
              checked={form.dealSources.includes(option.value)}
              onChange={handleCheckboxChange(option.value)}
              required={false}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500">Select all sources that apply to your mandate.</p>
      </div>
    </div>
  );
}
