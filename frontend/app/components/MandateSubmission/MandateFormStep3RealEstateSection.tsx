import type { MandateSubmissionForm } from '~/store/mandateSubmissionStore';
import { FormLabel, FormInput, FormSelect, Req } from '~/components/form';
import { useMandateForm } from '~/context/MandateFormContext';

export function MandateFormStep3RealEstateSection() {
  const {
    updateNestedField,
    form,
    realEstatePropertyTypeOptions,
    realEstateRiskReturnOptions,
    realEstateCheckSizeOptions,
    realEstateGeographicalFocusOptions,
    realEstateHoldPeriodOptions,
    realEstateProjectStageOptions,
    handleNestedInputChange,
  } = useMandateForm();

  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-6">
      <h3 className="text-lg font-medium text-gray-800">Real Estate</h3>

      {/* Property Type */}
      <div className={'form-input'}>
        <FormLabel htmlFor="realEstate.propertyType">
          Property Type <Req />
        </FormLabel>
        <FormSelect
          id="realEstate.propertyType"
          value={form.realEstate?.propertyType || ''}
          onChange={(value) => updateNestedField('realEstate', 'propertyType', value)}
          required
          options={[...realEstatePropertyTypeOptions]}
        />
      </div>

      {/* Other Property Type (conditional) */}
      {form.realEstate?.propertyType === 'other' && (
        <div className={'form-input'}>
          <FormLabel htmlFor="realEstate.otherPropertyType">
            Please specify property type <Req />
          </FormLabel>
          <FormInput
            id="realEstate.otherPropertyType"
            value={form.realEstate?.otherPropertyType || ''}
            onChange={handleNestedInputChange('realEstate')}
            required
            placeholder="Please specify"
          />
        </div>
      )}

      {/* Risk/Return Profile */}
      <div className={'form-input'}>
        <FormLabel htmlFor="realEstate.riskReturnProfile">
          Risk/Return Profile <Req />
        </FormLabel>
        <FormSelect
          id="realEstate.riskReturnProfile"
          value={form.realEstate?.riskReturnProfile || ''}
          onChange={(value) => updateNestedField('realEstate', 'riskReturnProfile', value)}
          required
          options={realEstateRiskReturnOptions}
        />
      </div>

      {/* Other Risk/Return Profile (conditional) */}
      {form.realEstate?.riskReturnProfile === 'other' && (
        <div className={'form-input'}>
          <FormLabel htmlFor="realEstate.otherRiskProfile">
            Please specify risk profile <Req />
          </FormLabel>
          <FormInput
            id="realEstate.otherRiskProfile"
            type="text"
            value={form.realEstate?.otherRiskProfile || ''}
            onChange={handleNestedInputChange('realEstate')}
            required
            placeholder="Please specify"
          />
        </div>
      )}

      {/* Check Size */}
      <div className={'form-input'}>
        <FormLabel htmlFor="realEstate.checkSize">
          Check Size <Req />
        </FormLabel>
        <FormSelect
          id="realEstate.checkSize"
          value={form.realEstate?.checkSize || ''}
          onChange={(value) => updateNestedField('realEstate', 'checkSize', value)}
          required
          options={realEstateCheckSizeOptions}
        />
      </div>

      {/* Geographical Focus */}
      <div className={'form-input'}>
        <FormLabel htmlFor="realEstate.geographicalFocus">
          Geographical Focus <Req />
        </FormLabel>
        <FormSelect
          id="realEstate.geographicalFocus"
          value={form.realEstate?.geographicalFocus || ''}
          onChange={(value) => updateNestedField('realEstate', 'geographicalFocus', value)}
          required
          options={realEstateGeographicalFocusOptions}
        />
      </div>

      {/* Other Geography (conditional) */}
      {form.realEstate?.geographicalFocus === 'other' && (
        <div className={'form-input'}>
          <FormLabel htmlFor="realEstate.otherGeography">
            Please specify geographical focus <Req />
          </FormLabel>
          <FormInput
            id="realEstate.otherGeography"
            type="text"
            value={form.realEstate?.otherGeography || ''}
            onChange={handleNestedInputChange('realEstate')}
            required
            placeholder="Please specify"
          />
        </div>
      )}

      {/* Preferred Hold Period */}
      <div className={'form-input'}>
        <FormLabel htmlFor="realEstate.holdPeriod">
          Preferred Hold Period <Req />
        </FormLabel>
        <FormSelect
          id="realEstate.holdPeriod"
          value={form.realEstate?.holdPeriod || ''}
          onChange={(value) => updateNestedField('realEstate', 'holdPeriod', value)}
          required
          options={realEstateHoldPeriodOptions}
        />
      </div>

      {/* Project Stage */}
      <div className={'form-input'}>
        <FormLabel htmlFor="realEstate.projectStage">
          Project Stage <Req />
        </FormLabel>
        <FormSelect
          id="realEstate.projectStage"
          value={form.realEstate?.projectStage || ''}
          onChange={(value) => updateNestedField('realEstate', 'projectStage', value)}
          required
          options={realEstateProjectStageOptions}
        />
      </div>

      {/* Other Project Stage (conditional) */}
      {form.realEstate?.projectStage === 'other' && (
        <div className={'form-input'}>
          <FormLabel htmlFor="realEstate.otherProjectStage">
            Please specify project stage <Req />
          </FormLabel>
          <FormInput
            id="realEstate.otherProjectStage"
            type="text"
            value={form.realEstate?.otherProjectStage || ''}
            onChange={handleNestedInputChange('realEstate')}
            required
            placeholder="Please specify"
          />
        </div>
      )}
    </div>
  );
}
