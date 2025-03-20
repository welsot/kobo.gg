import type { MandateDto, PublicMandateDto } from '~/api/apiSchemas';
import React from 'react';
import { getMandateValueLabel } from '~/utils/mandate';

export type CriterionDefinition = {
  id: string;
  question: React.ReactNode;
  criterionName: string;
  path: string;
};

function Label({ children }: { children: React.ReactNode }) {
  return <span className="font-bold">{children}</span>;
}

/**
 * Generates criteria questions based on mandate data
 */
export function generateMandateCriteria(
  mandate: PublicMandateDto | MandateDto,
): CriterionDefinition[] {
  const criteria: CriterionDefinition[] = [];

  // Add dealSources criterion if available
  if (mandate.dealSources) {
    const wantedSources = mandate.dealSources.map((src, index) => {
      return (
        <li key={index}>
          <Label>{getMandateValueLabel('dealSource', src)}</Label>
        </li>
      );
    });
    criteria.push({
      id: 'dealSources',
      question: (
        <>
          Is your deal from one of these preferred sources:
          <ul className="list-disc ml-6 mt-1">{wantedSources}</ul>
        </>
      ),
      criterionName: 'Sources',
      path: 'dealSources',
    });
  }

  if (mandate.investmentStrategy) {
    const investmentStrategy = getMandateValueLabel(
      'investmentStrategy',
      mandate.investmentStrategy,
    );
    criteria.push({
      id: 'investmentStrategy',
      question: (
        <>
          Is your deal's investment strategy <Label>{investmentStrategy}</Label>?
        </>
      ),
      criterionName: 'Investment Strategy',
      path: 'investmentStrategy',
    });
  }

  // Add real estate criteria
  if (mandate.investmentStrategy === 'realEstate' && mandate.realEstate) {
    if (mandate.realEstate.propertyType) {
      const propertyType = getMandateValueLabel(
        'realEstatePropertyType',
        mandate.realEstate.propertyType,
      );
      criteria.push({
        id: 'propertyType',
        question: (
          <>
            Is your deal's property type <Label>{propertyType}</Label>?
          </>
        ),
        criterionName: 'Property Type',
        path: 'realEstate.propertyType',
      });
    }

    if (mandate.realEstate.riskReturnProfile) {
      let riskReturnProfile = getMandateValueLabel(
        'realEstateRiskReturn',
        mandate.realEstate.riskReturnProfile,
      );

      if (riskReturnProfile === 'Other') {
        riskReturnProfile = mandate.realEstate.otherRiskProfile || '';
      }

      criteria.push({
        id: 'riskReturnProfile',
        question: (
          <>
            Does your deal match the risk/return profile <Label>{riskReturnProfile}</Label>?
          </>
        ),
        criterionName: 'Risk/Return Profile',
        path: 'realEstate.riskReturnProfile',
      });
    }

    if (mandate.realEstate.checkSize) {
      const checkSize = getMandateValueLabel('realEstateCheckSize', mandate.realEstate.checkSize);
      criteria.push({
        id: 'checkSize',
        question: (
          <>
            Does your deal meet the check size <Label>{checkSize}</Label>?
          </>
        ),
        criterionName: 'Check Size',
        path: 'realEstate.checkSize',
      });
    }

    if (mandate.realEstate.geographicalFocus) {
      let geographicalFocus = getMandateValueLabel(
        'realEstateGeographicalFocus',
        mandate.realEstate.geographicalFocus,
      );

      if (geographicalFocus === 'Other') {
        geographicalFocus = mandate.realEstate.otherGeography || '';
      }

      criteria.push({
        id: 'geographicalFocus',
        question: (
          <>
            Is your deal located in the geographical focus <Label>{geographicalFocus}</Label>?
          </>
        ),
        criterionName: 'Geographical Focus',
        path: 'realEstate.geographicalFocus',
      });
    }

    if (mandate.realEstate.holdPeriod) {
      let holdPeriod = getMandateValueLabel('realEstateHoldPeriod', mandate.realEstate.holdPeriod);

      if (holdPeriod === 'Other') {
      }

      criteria.push({
        id: 'holdPeriod',
        question: (
          <>
            Does your deal meet the hold period requirement of <Label>{holdPeriod}</Label>?
          </>
        ),
        criterionName: 'Hold Period',
        path: 'realEstate.holdPeriod',
      });
    }

    if (mandate.realEstate?.projectStage || mandate.realEstate?.otherProjectStage) {
      const otherProjectStage = mandate.realEstate.otherProjectStage;
      let projectStageVal = mandate.realEstate.projectStage
        ? getMandateValueLabel('realEstateProjectStage', mandate.realEstate.projectStage)
        : otherProjectStage;
      if (projectStageVal === 'Other') {
        projectStageVal = otherProjectStage || '';
      }
      criteria.push({
        id: 'projectStage',
        question: (
          <>
            Is your deal at the project stage <Label>{projectStageVal}</Label>?
          </>
        ),
        criterionName: 'Project Stage',
        path: 'realEstate.projectStage',
      });
    }
  }

  // Add private equity criteria
  if (mandate.investmentStrategy === 'privateEquity' && mandate.privateEquity) {
    if (mandate.privateEquity.preferredStrategy) {
      const preferredStrategy = getMandateValueLabel(
        'privateEquityStrategy',
        mandate.privateEquity.preferredStrategy,
      );
      criteria.push({
        id: 'preferredStrategy',
        question: (
          <>
            Does your deal follow the preferred strategy <Label>{preferredStrategy}</Label>?
          </>
        ),
        criterionName: 'Strategy',
        path: 'privateEquity.preferredStrategy',
      });
    }

    if (mandate.privateEquity.industryFocus) {
      const industryFocus = getMandateValueLabel(
        'privateEquityIndustry',
        mandate.privateEquity.industryFocus,
      );
      criteria.push({
        id: 'industryFocus',
        question: (
          <>
            Does your deal focus on the industry <Label>{industryFocus}</Label>?
          </>
        ),
        criterionName: 'Industry Focus',
        path: 'privateEquity.industryFocus',
      });
    }

    if (mandate.privateEquity.checkSize) {
      const checkSize = getMandateValueLabel(
        'privateEquityCheckSize',
        mandate.privateEquity.checkSize,
      );
      criteria.push({
        id: 'peCheckSize',
        question: (
          <>
            Does your deal meet the check size requirement of <Label>{checkSize}</Label>?
          </>
        ),
        criterionName: 'Check Size',
        path: 'privateEquity.checkSize',
      });
    }

    if (mandate.privateEquity.controlPreference) {
      const controlPreference = getMandateValueLabel(
        'privateEquityControl',
        mandate.privateEquity.controlPreference,
      );
      criteria.push({
        id: 'controlPreference',
        question: (
          <>
            Does your deal offer the control level <Label>{controlPreference}</Label>?
          </>
        ),
        criterionName: 'Control Preference',
        path: 'privateEquity.controlPreference',
      });
    }

    if (mandate.privateEquity.companyStage) {
      const companyStage = getMandateValueLabel(
        'privateEquityCompanyStage',
        mandate.privateEquity.companyStage,
      );
      criteria.push({
        id: 'companyStage',
        question: (
          <>
            Is your company at the stage <Label>{companyStage}</Label>?
          </>
        ),
        criterionName: 'Company Stage',
        path: 'privateEquity.companyStage',
      });
    }
  }

  // Add funds criteria
  if (mandate.investmentStrategy === 'funds' && mandate.funds) {
    if (mandate.funds.fundType) {
      const fundType = getMandateValueLabel('fundType', mandate.funds.fundType);
      criteria.push({
        id: 'fundType',
        question: (
          <>
            Is your fund of type <Label>{fundType}</Label>?
          </>
        ),
        criterionName: 'Fund Type',
        path: 'funds.fundType',
      });
    }

    if (mandate.funds.sectorFocus) {
      const sectorFocus = getMandateValueLabel('fundSectorFocus', mandate.funds.sectorFocus);
      criteria.push({
        id: 'sectorFocus',
        question: (
          <>
            Does your fund focus on the sector <Label>{sectorFocus}</Label>?
          </>
        ),
        criterionName: 'Sector Focus',
        path: 'funds.sectorFocus',
      });
    }

    if (mandate.funds.checkSize) {
      const checkSize = getMandateValueLabel('fundCheckSize', mandate.funds.checkSize);
      criteria.push({
        id: 'fundCheckSize',
        question: (
          <>
            Does your fund meet the investment size of <Label>{checkSize}</Label>?
          </>
        ),
        criterionName: 'Investment Size',
        path: 'funds.checkSize',
      });
    }

    if (mandate.funds.fundStage) {
      const fundStage = getMandateValueLabel('fundStage', mandate.funds.fundStage);
      criteria.push({
        id: 'fundStage',
        question: (
          <>
            Is your fund at the stage <Label>{fundStage}</Label>?
          </>
        ),
        criterionName: 'Fund Stage',
        path: 'funds.fundStage',
      });
    }
  }

  // Add trophy assets criteria
  if (mandate.investmentStrategy === 'trophyAssets' && mandate.trophyAssets) {
    if (mandate.trophyAssets.assetType) {
      const assetType = getMandateValueLabel('trophyAssetType', mandate.trophyAssets.assetType);
      criteria.push({
        id: 'assetType',
        question: (
          <>
            Is your asset of type <Label>{assetType}</Label>?
          </>
        ),
        criterionName: 'Asset Type',
        path: 'trophyAssets.assetType',
      });
    }

    if (mandate.trophyAssets.preferredGeography) {
      const preferredGeography = getMandateValueLabel(
        'trophyAssetGeography',
        mandate.trophyAssets.preferredGeography,
      );
      criteria.push({
        id: 'preferredGeography',
        question: (
          <>
            Is your asset located in the preferred geography <Label>{preferredGeography}</Label>?
          </>
        ),
        criterionName: 'Geography',
        path: 'trophyAssets.preferredGeography',
      });
    }

    if (mandate.trophyAssets.taxPreferences) {
      const taxPreferences = getMandateValueLabel(
        'trophyAssetTaxPreferences',
        mandate.trophyAssets.taxPreferences,
      );
      criteria.push({
        id: 'taxPreferences',
        question: (
          <>
            Does your asset require tax advantages? <Label>{taxPreferences}</Label>
          </>
        ),
        criterionName: 'Tax Preferences',
        path: 'trophyAssets.taxPreferences',
      });
    }
  }

  // Add tax advantaged criteria
  if (mandate.investmentStrategy === 'taxAdvantaged' && mandate.taxAdvantaged) {
    if (mandate.taxAdvantaged.primaryTaxProgram) {
      const primaryTaxProgram = getMandateValueLabel(
        'taxProgram',
        mandate.taxAdvantaged.primaryTaxProgram,
      );
      criteria.push({
        id: 'primaryTaxProgram',
        question: (
          <>
            Does your deal use the tax program <Label>{primaryTaxProgram}</Label>?
          </>
        ),
        criterionName: 'Tax Program',
        path: 'taxAdvantaged.primaryTaxProgram',
      });
    }

    if (mandate.taxAdvantaged.geographicFocus) {
      const geographicFocus = getMandateValueLabel(
        'taxGeographicFocus',
        mandate.taxAdvantaged.geographicFocus,
      );
      criteria.push({
        id: 'geographicFocus',
        question: (
          <>
            Is your deal located in <Label>{geographicFocus}</Label>?
          </>
        ),
        criterionName: 'Geographic Focus',
        path: 'taxAdvantaged.geographicFocus',
      });
    }

    if (mandate.taxAdvantaged.preferredStructures) {
      const structure = getMandateValueLabel(
        'taxStructure',
        mandate.taxAdvantaged.preferredStructures,
      );
      criteria.push({
        id: 'taxAdvantageStructure',
        question: (
          <>
            Does your deal follow the structure <Label>{structure}</Label>?
          </>
        ),
        criterionName: 'Structure',
        path: 'taxAdvantaged.preferredStructures',
      });
    }
  }

  // Add general criteria for all mandate types
  if (mandate.instrumentType) {
    let instrumentType = getMandateValueLabel('instrumentType', mandate.instrumentType);
    if (instrumentType === 'Other') {
      instrumentType = mandate.otherInstrumentType || '';
    }
    criteria.push({
      id: 'instrumentType',
      question: (
        <>
          Is your deal using the instrument type <Label>{instrumentType}</Label>?
        </>
      ),
      criterionName: 'Instrument Type',
      path: 'instrumentType',
    });
  }

  // Add syndication criterion if available
  if (mandate.syndicationPreference) {
    const syndicationPreference = getMandateValueLabel(
      'syndication',
      mandate.syndicationPreference,
    );
    criteria.push({
      id: 'syndicationPreference',
      question: (
        <>
          Does your deal's syndication structure match <Label>{syndicationPreference}</Label>?
        </>
      ),
      criterionName: 'Syndication',
      path: 'syndicationPreference',
    });
  }

  // Add sponsor track record criterion if available
  if (mandate.sponsorTrackRecord && mandate.sponsorTrackRecord !== 'noRequirement') {
    const trackRecord = getMandateValueLabel('sponsorTrackRecord', mandate.sponsorTrackRecord);
    criteria.push({
      id: 'sponsorTrackRecord',
      question: (
        <>
          Does your team have the required track record: <Label>{trackRecord}</Label>?
        </>
      ),
      criterionName: 'Sponsor Track Record',
      path: 'sponsorTrackRecord',
    });
  }

  if (mandate.minimumReturnTarget) {
    let minReturn = getMandateValueLabel('minimumReturn', mandate.minimumReturnTarget);

    if (minReturn === 'Custom') {
      minReturn = mandate.minimumReturnTargetCustomValue || '';
    }

    criteria.push({
      id: 'minimumReturnTarget',
      question: (
        <>
          Does your deal meet or exceed the minimum return target of <Label>{minReturn}</Label>?
        </>
      ),
      criterionName: 'Minimum Return',
      path: 'minimumReturnTarget',
    });
  }

  // Add geographical restrictions
  if (mandate.geographicalRestrictions) {
    criteria.push({
      id: 'geographicalRestrictions',
      question: (
        <>
          Is your deal compatible with the geographical restrictions:{' '}
          <Label>{mandate.geographicalRestrictions}</Label>?
        </>
      ),
      criterionName: 'Geographical Restrictions',
      path: 'geographicalRestrictions',
    });
  }

  // Add deal breakers
  if (mandate.dealBreakers) {
    criteria.push({
      id: 'dealBreakers',
      question: (
        <>
          Does your deal avoid these deal breakers: <Label>{mandate.dealBreakers}</Label>?
        </>
      ),
      criterionName: 'Deal Breakers',
      path: 'dealBreakers',
    });
  }

  return criteria;
}
