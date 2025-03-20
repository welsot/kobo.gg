import { Link } from 'react-router';
import { CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import type { DealDto, PublicMandateDto } from '~/api/apiSchemas';
import { DealCompatibility } from './DealCompatibility';

type DealSubmissionSucessProps = {
  deal: DealDto;
  mandate: PublicMandateDto;
};

export function DealSubmissionSuccess({ deal, mandate }: DealSubmissionSucessProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 bg-white">
      <div className="text-center">
        <div className="flex justify-center items-center mb-6">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Deal Submitted Successfully!</h1>
        <p className="text-lg text-gray-600 mb-8">
          Your deal has been submitted and will be reviewed by the mandate owner. You will be
          contacted if there is interest in moving forward.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/mandates"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Browse More Mandates
          </Link>
          <Link
            to="/dashboard"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>

      {/* Deal Compatibility Analysis */}
      <div className="mt-12">
        <DealCompatibility deal={deal} mandate={mandate} />
      </div>

      <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              The mandate owner will review your submission and may contact you for additional
              information or to discuss next steps. The review process typically takes 3-5 business
              days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
