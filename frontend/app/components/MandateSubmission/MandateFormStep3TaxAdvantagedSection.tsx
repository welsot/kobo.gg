import { FormInput, FormLabel, FormSelect, Req } from '~/components/form';
import { useMandateForm } from '~/context/MandateFormContext';

export function MandateFormStep3TaxAdvantagedSection() {
  const {
    form,
    handleNestedInputChange,
    taxProgramOptions,
    taxStructureOptions,
    taxGeographicFocusOptions,
    updateNestedField,
  } = useMandateForm();

  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-6">
      <h3 className="text-lg font-medium text-gray-800">Tax-Advantaged Investments</h3>

      {/* Primary Tax Program */}
      <div className={'form-input'}>
        <FormLabel htmlFor="taxAdvantaged.primaryTaxProgram">
          Primary Tax Program <Req />
        </FormLabel>
        <FormSelect
          id="taxAdvantaged.primaryTaxProgram"
          value={form.taxAdvantaged?.primaryTaxProgram || ''}
          onChange={(value) => updateNestedField('taxAdvantaged', 'primaryTaxProgram', value)}
          options={taxProgramOptions}
          required
        />
      </div>

      {/* Other Tax Program (conditional) */}
      {form.taxAdvantaged?.primaryTaxProgram === 'other' && (
        <div className={'form-input'}>
          <FormLabel htmlFor="taxAdvantaged.otherTaxProgram">
            Please specify tax program <Req />
          </FormLabel>
          <FormInput
            id="taxAdvantaged.otherTaxProgram"
            value={form.taxAdvantaged?.otherTaxProgram || ''}
            onChange={handleNestedInputChange('taxAdvantaged')}
            required
            placeholder="Please specify"
          />
        </div>
      )}

      {/* Preferred Structures */}
      <div className={'form-input'}>
        <FormLabel htmlFor="taxAdvantaged.preferredStructures">
          Preferred Structures <Req />
        </FormLabel>
        <FormSelect
          id="taxAdvantaged.preferredStructures"
          value={form.taxAdvantaged?.preferredStructures || ''}
          onChange={(val) => updateNestedField('taxAdvantaged', 'preferredStructures', val)}
          options={taxStructureOptions}
          required
        />
      </div>

      {/* Other Structure (conditional) */}
      {form.taxAdvantaged?.preferredStructures === 'other' && (
        <div className={'form-input'}>
          <FormLabel htmlFor="taxAdvantaged.otherStructure">
            Please specify structure <Req />
          </FormLabel>
          <FormInput
            id="taxAdvantaged.otherStructure"
            value={form.taxAdvantaged?.otherStructure || ''}
            onChange={handleNestedInputChange('taxAdvantaged')}
            required
            placeholder="Please specify"
          />
        </div>
      )}

      {/* Geographic Focus */}
      <div className={'form-input'}>
        <FormLabel htmlFor="taxAdvantaged.geographicFocus">
          Geographic Focus <Req />
        </FormLabel>
        <FormSelect
          id="taxAdvantaged.geographicFocus"
          value={form.taxAdvantaged?.geographicFocus || ''}
          onChange={(val) => updateNestedField('taxAdvantaged', 'geographicFocus', val)}
          options={taxGeographicFocusOptions}
          required
        />
      </div>

      {/* Geography Details (conditional) */}
      {form.taxAdvantaged?.geographicFocus &&
        ['northAmerica', 'international'].includes(form.taxAdvantaged?.geographicFocus) && (
          <div className={'form-input'}>
            <FormLabel htmlFor="taxAdvantaged.geographyDetails">
              Please specify geographic details <Req />
            </FormLabel>
            <FormInput
              id="taxAdvantaged.geographyDetails"
              value={form.taxAdvantaged?.geographyDetails || ''}
              onChange={handleNestedInputChange('taxAdvantaged')}
              required
              placeholder={
                form.taxAdvantaged?.geographicFocus === 'northAmerica'
                  ? 'E.g., specific U.S. states'
                  : 'E.g., specific countries'
              }
            />
          </div>
        )}
    </div>
  );
}
