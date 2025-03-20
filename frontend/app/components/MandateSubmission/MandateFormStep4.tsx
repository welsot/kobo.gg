import { FormLabel, FormInput, FormSelect, FormTextarea, Req } from '~/components/form';
import { useMandateForm } from '~/context/MandateFormContext';

export function MandateFormStep4() {
  const {
    form,
    handleInputChange,
    handleSelectChange,
    minimumReturnOptions,
    sponsorTrackRecordOptions,
  } = useMandateForm();
  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Exclusions & Hurdles</h2>
        <p className="mt-1 text-sm text-gray-600">
          Specify any deal breakers, minimum requirements, and geographic restrictions.
        </p>
      </div>

      {/* Deal Breakers */}
      <div className={'form-input'}>
        <FormLabel htmlFor="dealBreakers">Deal Breakers</FormLabel>
        <div className="mt-1">
          <FormTextarea
            id="dealBreakers"
            value={form.dealBreakers || ''}
            onChange={handleInputChange}
            rows={3}
            placeholder="Are there specific industries, business models, or deal structures you will not consider?"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          List any deal breakers or industries, models, or structures you avoid.
        </p>
      </div>

      {/* Minimum Return Target */}
      <div className={'form-input'}>
        <FormLabel htmlFor="minimumReturnTarget">
          Minimum Return Target <Req />
        </FormLabel>
        <FormSelect
          id="minimumReturnTarget"
          value={form.minimumReturnTarget || ''}
          onChange={(value) => handleSelectChange('minimumReturnTarget', value)}
          required
          options={minimumReturnOptions}
        />
      </div>

      {/* Custom Return Target (conditional) */}
      {form.minimumReturnTarget === 'custom' && (
        <div className={'form-input'}>
          <FormLabel htmlFor="minimumReturnTargetCustomValue">
            Please specify custom return target <Req />
          </FormLabel>
          <FormInput
            id="minimumReturnTargetCustomValue"
            value={form.minimumReturnTargetCustomValue || ''}
            onChange={handleInputChange}
            required
            placeholder="E.g., 12% IRR, 2.2x MOIC"
          />
        </div>
      )}

      {/* Sponsor / Operator Track Record */}
      <div className={'form-input'}>
        <FormLabel htmlFor="sponsorTrackRecord">
          Sponsor / Operator Track Record <Req />
        </FormLabel>
        <FormSelect
          id="sponsorTrackRecord"
          value={form.sponsorTrackRecord || ''}
          onChange={(value) => handleSelectChange('sponsorTrackRecord', value)}
          required
          options={sponsorTrackRecordOptions}
        />
      </div>

      {/* Geographical Restrictions */}
      <div className={'form-input'}>
        <FormLabel htmlFor="geographicalRestrictions">Geographical Restrictions</FormLabel>
        <div className="mt-1">
          <FormTextarea
            id="geographicalRestrictions"
            value={form.geographicalRestrictions || ''}
            onChange={handleInputChange}
            rows={3}
            placeholder="List any regions you avoid or prefer."
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Specify any regions or countries you will not invest in.
        </p>
      </div>
    </div>
  );
}
