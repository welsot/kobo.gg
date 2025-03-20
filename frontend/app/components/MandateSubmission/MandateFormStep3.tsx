import { FormInput, FormLabel, FormSelect, Req } from '~/components/form';
import { MandateFormStep3RealEstateSection } from './MandateFormStep3RealEstateSection';
import { MandateFormStep3PrivateEquitySection } from './MandateFormStep3PrivateEquitySection';
import { MandateFormStep3TrophyAssetsSection } from './MandateFormStep3TrophyAssetsSection';
import { MandateFormStep3FundsSection } from './MandateFormStep3FundsSection';
import { MandateFormStep3TaxAdvantagedSection } from './MandateFormStep3TaxAdvantagedSection';
import { useMandateForm } from '~/context/MandateFormContext';

export function MandateFormStep3() {
  const { form } = useMandateForm();

  const isOther = form.investmentStrategy === 'other';

  return (
    <>
      <div className="space-y-8">
        {!isOther && (
          <div className="pb-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Strategy-Specific Details</h2>
            <p className="mt-1 text-sm text-gray-600">
              Provide details about your selected investment strategy.
            </p>
          </div>
        )}

        {/* Real Estate Section */}
        {form.investmentStrategy === 'realEstate' && <MandateFormStep3RealEstateSection />}

        {/* Private Equity Section */}
        {form.investmentStrategy === 'privateEquity' && <MandateFormStep3PrivateEquitySection />}

        {/* Trophy Assets Section */}
        {form.investmentStrategy == 'trophyAssets' && <MandateFormStep3TrophyAssetsSection />}

        {/* Funds Section */}
        {form.investmentStrategy === 'funds' && <MandateFormStep3FundsSection />}

        {/* Tax-Advantaged Section */}
        {form.investmentStrategy === 'taxAdvantaged' && <MandateFormStep3TaxAdvantagedSection />}

        {/* Message if no strategy specified */}
        {!form.investmentStrategy && !form.otherStrategy && (
          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 text-center">
            <p className="text-yellow-800">
              Please go back to the previous step and select an investment strategy.
            </p>
          </div>
        )}
      </div>
      <InstrumentsAndStructure />
    </>
  );
}

function InstrumentsAndStructure() {
  const { form, handleInputChange, handleSelectChange, instrumentTypeOptions, syndicationOptions } =
    useMandateForm();

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Instruments & Structure</h2>
        <p className="mt-1 text-sm text-gray-600">
          Specify your preferences for investment instruments and deal structures.
        </p>
      </div>

      {/* Instrument Type */}
      <div className={'form-input'}>
        <FormLabel htmlFor="instrumentType">
          Instrument Type <Req />
        </FormLabel>
        <FormSelect
          id="instrumentType"
          value={form.instrumentType || ''}
          onChange={(value) => handleSelectChange('instrumentType', value)}
          required
          options={instrumentTypeOptions}
        />
      </div>

      {/* Other Instrument Type (conditional) */}
      {form.instrumentType === 'other' && (
        <div className={'form-input'}>
          <FormLabel htmlFor="otherInstrumentType">
            Please specify instrument type <Req />
          </FormLabel>
          <FormInput
            id="otherInstrumentType"
            value={form.otherInstrumentType || ''}
            onChange={handleInputChange}
            required
            placeholder="Please specify"
          />
        </div>
      )}

      {/* Syndication / Club Deals */}
      <div className={'form-input'}>
        <FormLabel htmlFor="syndicationPreference">
          Syndication / Club Deals <Req />
        </FormLabel>
        <FormSelect
          id="syndicationPreference"
          value={form.syndicationPreference || ''}
          onChange={(value) => handleSelectChange('syndicationPreference', value)}
          required
          options={syndicationOptions}
        />
      </div>
    </div>
  );
}
