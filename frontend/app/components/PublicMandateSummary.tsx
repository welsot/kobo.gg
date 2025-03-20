import type { PublicMandateDto } from '~/api/apiSchemas';
import { getMandateValueLabel } from '~/utils/mandate';

type PublicMandateSummaryProps = {
  mandate: PublicMandateDto;
  className?: string;
  showSubmitDealButton?: boolean;
};

export function PublicMandateSummary({ mandate, className = '' }: PublicMandateSummaryProps) {
  return (
    <div className={`bg-gray-50 rounded-lg p-6 text-left border border-gray-200 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Mandate Summary</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            {mandate.investmentStrategy && (
              <div>
                <span className="font-medium">Investment Strategy:</span>{' '}
                {getMandateValueLabel('investmentStrategy', mandate.investmentStrategy)}
                {mandate.otherStrategy && ` - ${mandate.otherStrategy}`}
              </div>
            )}

            {mandate.instrumentType && (
              <div>
                <span className="font-medium">Instrument Type:</span>{' '}
                {getMandateValueLabel('instrumentType', mandate.instrumentType)}
                {mandate.otherInstrumentType && ` - ${mandate.otherInstrumentType}`}
              </div>
            )}

            {mandate.syndicationPreference && (
              <div>
                <span className="font-medium">Syndication Preference:</span>{' '}
                {getMandateValueLabel('syndication', mandate.syndicationPreference)}
              </div>
            )}

            {mandate.minimumReturnTarget && (
              <div>
                <span className="font-medium">Minimum Return Target:</span>{' '}
                {getMandateValueLabel('minimumReturn', mandate.minimumReturnTarget)}
                {mandate.minimumReturnTargetCustomValue &&
                  ` - ${mandate.minimumReturnTargetCustomValue}`}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {mandate.sponsorTrackRecord && (
              <div>
                <span className="font-medium">Sponsor Track Record:</span>{' '}
                {getMandateValueLabel('sponsorTrackRecord', mandate.sponsorTrackRecord)}
              </div>
            )}
            {mandate.geographicalRestrictions && (
              <div>
                <span className="font-medium">Geographical Restrictions:</span>{' '}
                {mandate.geographicalRestrictions}
              </div>
            )}
            {mandate.dealBreakers && (
              <div>
                <span className="font-medium">Deal Breakers:</span> {mandate.dealBreakers}
              </div>
            )}
            {mandate.additionalDetails && (
              <div>
                <span className="font-medium">Additional Details:</span> {mandate.additionalDetails}
              </div>
            )}
          </div>
        </div>

        {mandate.realEstate && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium mb-2">Real Estate Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mandate.realEstate && mandate.realEstate.propertyType && (
                <div>
                  <span className="font-medium">Property Type:</span>{' '}
                  {getMandateValueLabel('realEstatePropertyType', mandate.realEstate.propertyType)}
                  {mandate.realEstate.otherPropertyType &&
                    ` - ${mandate.realEstate.otherPropertyType}`}
                </div>
              )}

              {mandate.realEstate && mandate.realEstate.riskReturnProfile && (
                <div>
                  <span className="font-medium">Risk/Return Profile:</span>{' '}
                  {getMandateValueLabel(
                    'realEstateRiskReturn',
                    mandate.realEstate.riskReturnProfile,
                  )}
                  {mandate.realEstate.otherRiskProfile &&
                    ` - ${mandate.realEstate.otherRiskProfile}`}
                </div>
              )}

              {mandate.realEstate && mandate.realEstate.checkSize && (
                <div>
                  <span className="font-medium">Check Size:</span>{' '}
                  {getMandateValueLabel('realEstateCheckSize', mandate.realEstate.checkSize)}
                </div>
              )}
            </div>
          </div>
        )}

        {mandate.privateEquity && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium mb-2">Private Equity Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mandate.privateEquity.preferredStrategy && (
                <div>
                  <span className="font-medium">Preferred Strategy:</span>{' '}
                  {getMandateValueLabel(
                    'privateEquityStrategy',
                    mandate.privateEquity.preferredStrategy,
                  )}
                  {mandate.privateEquity.otherStrategy &&
                    ` - ${mandate.privateEquity.otherStrategy}`}
                </div>
              )}

              {mandate.privateEquity.industryFocus && (
                <div>
                  <span className="font-medium">Industry Focus:</span>{' '}
                  {getMandateValueLabel(
                    'privateEquityIndustry',
                    mandate.privateEquity.industryFocus,
                  )}
                  {mandate.privateEquity.otherIndustry &&
                    ` - ${mandate.privateEquity.otherIndustry}`}
                </div>
              )}

              {mandate.privateEquity.checkSize && (
                <div>
                  <span className="font-medium">Check Size:</span>{' '}
                  {getMandateValueLabel('privateEquityCheckSize', mandate.privateEquity.checkSize)}
                </div>
              )}
            </div>
          </div>
        )}

        {mandate.funds && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium mb-2">Funds Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mandate.funds.fundType && (
                <div>
                  <span className="font-medium">Fund Type:</span>{' '}
                  {getMandateValueLabel('fundType', mandate.funds.fundType)}
                  {mandate.funds.otherFundType && ` - ${mandate.funds.otherFundType}`}
                </div>
              )}

              {mandate.funds.fundStage && (
                <div>
                  <span className="font-medium">Fund Stage:</span>{' '}
                  {getMandateValueLabel('fundStage', mandate.funds.fundStage)}
                </div>
              )}

              {mandate.funds.sectorFocus && (
                <div>
                  <span className="font-medium">Sector Focus:</span>{' '}
                  {getMandateValueLabel('fundSectorFocus', mandate.funds.sectorFocus)}
                  {mandate.funds.otherSector && ` - ${mandate.funds.otherSector}`}
                </div>
              )}
            </div>
          </div>
        )}

        {mandate.trophyAssets && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium mb-2">Trophy Assets Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mandate.trophyAssets.assetType && (
                <div>
                  <span className="font-medium">Asset Type:</span>{' '}
                  {getMandateValueLabel('trophyAssetType', mandate.trophyAssets.assetType)}
                  {mandate.trophyAssets.otherAssetType &&
                    ` - ${mandate.trophyAssets.otherAssetType}`}
                </div>
              )}

              {mandate.trophyAssets.preferredGeography && (
                <div>
                  <span className="font-medium">Preferred Geography:</span>{' '}
                  {getMandateValueLabel(
                    'trophyAssetGeography',
                    mandate.trophyAssets.preferredGeography,
                  )}
                  {mandate.trophyAssets.geographyDetails &&
                    ` - ${mandate.trophyAssets.geographyDetails}`}
                </div>
              )}
            </div>
          </div>
        )}

        {mandate.taxAdvantaged && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium mb-2">Tax Advantaged Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mandate.taxAdvantaged && mandate.taxAdvantaged.primaryTaxProgram && (
                <div>
                  <span className="font-medium">Primary Tax Program:</span>{' '}
                  {getMandateValueLabel('taxProgram', mandate.taxAdvantaged.primaryTaxProgram)}
                  {mandate.taxAdvantaged.otherTaxProgram &&
                    ` - ${mandate.taxAdvantaged.otherTaxProgram}`}
                </div>
              )}

              {mandate.taxAdvantaged && mandate.taxAdvantaged.preferredStructures && (
                <div>
                  <span className="font-medium">Preferred Structures:</span>{' '}
                  {getMandateValueLabel('taxStructure', mandate.taxAdvantaged.preferredStructures)}
                  {mandate.taxAdvantaged.otherStructure &&
                    ` - ${mandate.taxAdvantaged.otherStructure}`}
                </div>
              )}

              {mandate.taxAdvantaged && mandate.taxAdvantaged.geographicFocus && (
                <div>
                  <span className="font-medium">Geographic Focus:</span>{' '}
                  {getMandateValueLabel(
                    'taxGeographicFocus',
                    mandate.taxAdvantaged.geographicFocus,
                  )}
                  {mandate.taxAdvantaged.geographyDetails &&
                    ` - ${mandate.taxAdvantaged.geographyDetails}`}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
