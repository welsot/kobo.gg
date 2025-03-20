import type { MandateSubmissionForm } from '~/store/mandateSubmissionStore';
import { FormInput, FormLabel, FormSelect, FormTextarea, Req } from '~/components/form';
import { useMandateForm } from '~/context/MandateFormContext';

export function MandateFormStep3TrophyAssetsSection() {
  const {
    form,
    handleNestedInputChange,

    trophyAssetTypeOptions,
    trophyAssetGeographyOptions,
    trophyAssetTaxPreferencesOptions,
    updateNestedField,
  } = useMandateForm();

  const handleSelectChange = (fieldName: string, value: string) => {
    updateNestedField('trophyAssets', fieldName, value);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-6">
      <h3 className="text-lg font-medium text-gray-800">Trophy Assets</h3>

      {/* Asset Type */}
      <div className={'form-input'}>
        <FormLabel htmlFor="trophyAssets.assetType">
          Asset Type <Req />
        </FormLabel>
        <FormSelect
          id="trophyAssets.assetType"
          options={trophyAssetTypeOptions}
          value={form.trophyAssets?.assetType || ''}
          onChange={(value) => handleSelectChange('assetType', value)}
          required
        />
      </div>

      {/* Other Asset Type (conditional) */}
      {form.trophyAssets?.assetType === 'other' && (
        <div className={'form-input'}>
          <FormLabel htmlFor="trophyAssets.otherAssetType">
            Please specify asset type <Req />
          </FormLabel>
          <FormInput
            id="trophyAssets.otherAssetType"
            value={form.trophyAssets?.otherAssetType || ''}
            onChange={handleNestedInputChange('trophyAssets')}
            required
            placeholder="Please specify"
          />
        </div>
      )}

      {/* Preferred Geography */}
      <div className={'form-input'}>
        <FormLabel htmlFor="trophyAssets.preferredGeography">
          Preferred Geography <Req />
        </FormLabel>
        <FormSelect
          id="trophyAssets.preferredGeography"
          options={trophyAssetGeographyOptions}
          value={form.trophyAssets?.preferredGeography || ''}
          onChange={(value) => handleSelectChange('preferredGeography', value)}
          required
        />
      </div>

      {/* Geography Details (conditional) */}
      {form.trophyAssets?.preferredGeography === 'domestic' && (
        <div className={'form-input'}>
          <FormLabel htmlFor="trophyAssets.geographyDetails">
            Please specify country or region <Req />
          </FormLabel>
          <FormInput
            id="trophyAssets.geographyDetails"
            value={form.trophyAssets?.geographyDetails || ''}
            onChange={handleNestedInputChange('trophyAssets')}
            required
            placeholder="E.g., United States, Western Europe"
          />
        </div>
      )}

      {/* Tax or Structural Preferences */}
      <div className={'form-input'}>
        <FormLabel htmlFor="trophyAssets.taxPreferences">
          Tax or Structural Preferences <Req />
        </FormLabel>
        <FormSelect
          id="trophyAssets.taxPreferences"
          options={trophyAssetTaxPreferencesOptions}
          value={form.trophyAssets?.taxPreferences || ''}
          onChange={(value) => handleSelectChange('taxPreferences', value)}
          required
        />
      </div>

      {/* Tax Preferences Details (conditional) */}
      {form.trophyAssets?.taxPreferences === 'yes' && (
        <div className={'form-input'}>
          <FormLabel htmlFor="trophyAssets.taxPreferencesDetails">
            Please specify tax preferences <Req />
          </FormLabel>
          <div className="mt-1">
            <FormTextarea
              id="trophyAssets.taxPreferencesDetails"
              value={form.trophyAssets?.taxPreferencesDetails || ''}
              onChange={handleNestedInputChange('trophyAssets')}
              rows={3}
              required={true}
              placeholder="Please specify your tax or structural preferences"
            />
          </div>
        </div>
      )}
    </div>
  );
}
