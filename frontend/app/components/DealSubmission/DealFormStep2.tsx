import { FormInput, FormLabel, FormRadioGroup, FormCheckbox } from '../form';
import { useDealSubmission } from '~/context/DealSubmissionContext';

export function DealFormStep2() {
  const { form, mandateCriteria, handleCriteriaAnswer, handleCriteriaNote } = useDealSubmission();

  const renderCriterionByType = (criterion: any) => {
    return (
      <div
        key={criterion.id}
        className="p-4 border border-gray-200 rounded-md"
        id={`criterion-${criterion.id}`}
      >
        <h3 className="font-medium text-gray-800 mb-2">{criterion.criterionName}</h3>
        <div className="text-gray-700 mb-4">{criterion.question}</div>

        <FormRadioGroup
          name={`criterion-${criterion.id}`}
          options={[
            { value: 'true', label: 'Yes' },
            { value: 'false', label: 'No' },
          ]}
          value={
            form.criteriaAnswers[criterion.path] === undefined
              ? 'false'
              : form.criteriaAnswers[criterion.path].toString()
          }
          onChange={(value) => handleCriteriaAnswer(criterion.path, value === 'true')}
        />

        {/* Show text field for explanation if the answer is "No" */}
        {form.criteriaAnswers[criterion.path] === false && (
          <div className="mt-3">
            <FormLabel htmlFor={`notes-${criterion.id}`}>
              Please explain why your deal doesn't meet this criterion (optional)
            </FormLabel>
            <FormInput
              id={`notes-${criterion.id}`}
              type="text"
              value={form.criteriaNotes[criterion.path] || ''}
              onChange={(e) => handleCriteriaNote(criterion.path, e.target.value)}
              placeholder="Provide details..."
            />
          </div>
        )}
      </div>
    );
  };

  // Group criteria by investment type
  const getGroupedCriteria = () => {
    const groupedCriteria: { [key: string]: any[] } = {
      general: [],
      realEstate: [],
      privateEquity: [],
      funds: [],
      trophyAssets: [],
      taxAdvantaged: [],
    };

    mandateCriteria.forEach((criterion) => {
      // Determine which group the criterion belongs to based on its path
      if (criterion.path.startsWith('realEstate.')) {
        groupedCriteria.realEstate.push(criterion);
      } else if (criterion.path.startsWith('privateEquity.')) {
        groupedCriteria.privateEquity.push(criterion);
      } else if (criterion.path.startsWith('funds.')) {
        groupedCriteria.funds.push(criterion);
      } else if (criterion.path.startsWith('trophyAssets.')) {
        groupedCriteria.trophyAssets.push(criterion);
      } else if (criterion.path.startsWith('taxAdvantaged.')) {
        groupedCriteria.taxAdvantaged.push(criterion);
      } else {
        groupedCriteria.general.push(criterion);
      }
    });

    return groupedCriteria;
  };

  const groupedCriteria = getGroupedCriteria();

  // Only show sections that have criteria
  const hasRealEstateCriteria = groupedCriteria.realEstate.length > 0;
  const hasPrivateEquityCriteria = groupedCriteria.privateEquity.length > 0;
  const hasFundsCriteria = groupedCriteria.funds.length > 0;
  const hasTrophyAssetsCriteria = groupedCriteria.trophyAssets.length > 0;
  const hasTaxAdvantagedCriteria = groupedCriteria.taxAdvantaged.length > 0;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium text-gray-900">Mandate Criteria</h2>
      <p className="text-gray-600">
        Please confirm if your deal meets the following investment criteria specified in the
        mandate. All fields are optional, but matching criteria increases the chances of your deal
        being accepted.
      </p>

      <div className="space-y-8">
        {/* General Criteria */}
        {groupedCriteria.general.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">General Criteria</h3>
            <div className="space-y-4">{groupedCriteria.general.map(renderCriterionByType)}</div>
          </div>
        )}

        {/* Real Estate Criteria */}
        {hasRealEstateCriteria && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Real Estate Criteria</h3>
            <div className="space-y-4">{groupedCriteria.realEstate.map(renderCriterionByType)}</div>
          </div>
        )}

        {/* Private Equity Criteria */}
        {hasPrivateEquityCriteria && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Private Equity Criteria</h3>
            <div className="space-y-4">
              {groupedCriteria.privateEquity.map(renderCriterionByType)}
            </div>
          </div>
        )}

        {/* Funds Criteria */}
        {hasFundsCriteria && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Funds Criteria</h3>
            <div className="space-y-4">{groupedCriteria.funds.map(renderCriterionByType)}</div>
          </div>
        )}

        {/* Trophy Assets Criteria */}
        {hasTrophyAssetsCriteria && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Trophy Assets Criteria</h3>
            <div className="space-y-4">
              {groupedCriteria.trophyAssets.map(renderCriterionByType)}
            </div>
          </div>
        )}

        {/* Tax Advantaged Criteria */}
        {hasTaxAdvantagedCriteria && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Tax Advantaged Criteria</h3>
            <div className="space-y-4">
              {groupedCriteria.taxAdvantaged.map(renderCriterionByType)}
            </div>
          </div>
        )}

        {/* Show a message if there are no criteria */}
        {mandateCriteria.length === 0 && (
          <div className="p-4 bg-gray-50 rounded-md text-center">
            <p className="text-gray-600">No specific criteria defined for this mandate.</p>
          </div>
        )}
      </div>
    </div>
  );
}
