import React from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import type { DealDto, MandateDto, PublicMandateDto } from '~/api/apiSchemas';
import { generateMandateCriteria } from '~/utils/criteria';

type DealCompatibilityProps = {
  deal: DealDto;
  mandate: PublicMandateDto | MandateDto;
};

export function DealCompatibility({ deal, mandate }: DealCompatibilityProps) {
  const criteria = generateMandateCriteria(mandate);

  // Calculate compatibility score (percentage of criteria met)
  const totalCriteria = criteria.length;
  const metCriteria = criteria.reduce((count, criterion) => {
    const criterionPath = criterion.path;
    const isMetByDeal = getCriterionValueFromPath(deal, criterionPath);
    return isMetByDeal ? count + 1 : count;
  }, 0);

  const compatibilityScore =
    totalCriteria > 0 ? Math.round((metCriteria / totalCriteria) * 100) : 100;

  // Determine compatibility level based on score
  const getCompatibilityLevel = (score: number) => {
    if (score >= 90)
      return { text: 'Excellent Match', color: 'text-green-700', bgColor: 'bg-green-100' };
    if (score >= 75) return { text: 'Good Match', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (score >= 50)
      return { text: 'Fair Match', color: 'text-yellow-700', bgColor: 'bg-yellow-100' };
    return { text: 'Poor Match', color: 'text-red-700', bgColor: 'bg-red-100' };
  };

  const compatibilityLevel = getCompatibilityLevel(compatibilityScore);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Deal Compatibility Assessment</h2>

      {/* Compatibility Score */}
      <div
        className={`${compatibilityLevel.bgColor} ${compatibilityLevel.color} flex items-center justify-between p-4 rounded-lg mb-6`}
      >
        <div className="flex items-center">
          {compatibilityScore >= 75 ? (
            <CheckCircleIcon className="h-8 w-8 mr-2" />
          ) : compatibilityScore >= 50 ? (
            <ExclamationCircleIcon className="h-8 w-8 mr-2" />
          ) : (
            <XCircleIcon className="h-8 w-8 mr-2" />
          )}
          <div>
            <div className="font-bold text-lg">{compatibilityLevel.text}</div>
            <div className="text-sm">Based on mandate requirements</div>
          </div>
        </div>
        <div className="text-3xl font-bold">{compatibilityScore}%</div>
      </div>

      {/* Criteria Breakdown */}
      <div className="space-y-4">
        <h3 className="font-medium text-lg">Criteria Breakdown</h3>

        {criteria.map((criterion) => {
          const criterionPath = criterion.path;
          const isMetByDeal = getCriterionValueFromPath(deal, criterionPath);
          const note = deal.notes?.[criterionPath];

          return (
            <div key={criterion.id} className="border rounded-md p-4">
              <div className="flex justify-between">
                <div className="flex-1">
                  <div className="font-medium">{criterion.criterionName}</div>
                  <div className="text-sm text-gray-600 mt-1">{criterion.question}</div>

                  {/* Show note if criterion is not met and there's a note */}
                  {!isMetByDeal && note && (
                    <div className="mt-2 italic text-sm bg-blue-50 p-2 rounded border-l-4 border-blue-500">
                      <span className="font-medium">Note from deal owner:</span> {note}
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  {isMetByDeal ? (
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircleIcon className="h-6 w-6 text-red-600" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper function to get criterion value from nested path
function getCriterionValueFromPath(deal: DealDto, path: string): boolean {
  const parts = path.split('.');

  if (parts.length === 1) {
    // Direct property on deal
    return Boolean(deal[parts[0] as keyof DealDto]);
  } else if (parts.length === 2) {
    // Nested property on a specific strategy
    const [strategy, property] = parts;
    const strategyObj = deal[strategy as keyof DealDto];

    if (strategyObj && typeof strategyObj === 'object') {
      return Boolean((strategyObj as Record<string, unknown>)[property]);
    }
  }

  return false;
}
