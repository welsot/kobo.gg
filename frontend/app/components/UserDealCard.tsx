import type { UserDealDto } from '~/api/apiSchemas';
import {
  CalendarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { mapPublicMandateToCardProps } from '~/utils/mandate';
import { format, parseISO } from 'date-fns';

type UserDealCardProps = {
  userDeal: UserDealDto;
};

export function UserDealCard({ userDeal }: UserDealCardProps) {
  const mandateProps = mapPublicMandateToCardProps(userDeal.mandate);
  const description = userDeal.deal.description || 'No description provided';

  // Format date for better readability
  const formattedDate = userDeal.createdAt
    ? format(parseISO(userDeal.createdAt), 'MMM d, yyyy')
    : 'Date not available';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg text-gray-900">
          {mandateProps.title || 'Investment Opportunity'}
        </h3>
        <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
          {mandateProps.investmentType}
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{description}</p>

      <div className="space-y-2">
        <div className="flex items-start">
          <span className="text-gray-500 w-32 text-sm flex items-center">
            <CurrencyDollarIcon className="h-4 w-4 mr-1" />
            Check Size:
          </span>
          <span className="text-gray-700 text-sm">{mandateProps.checkSize}</span>
        </div>

        <div className="flex items-start">
          <span className="text-gray-500 w-32 text-sm flex items-center">
            <MapPinIcon className="h-4 w-4 mr-1" />
            Location:
          </span>
          <span className="text-gray-700 text-sm">{mandateProps.location}</span>
        </div>

        <div className="flex items-start">
          <span className="text-gray-500 w-32 text-sm flex items-center">
            <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
            Target Return:
          </span>
          <span className="text-gray-700 text-sm">{mandateProps.targetReturn}</span>
        </div>

        <div className="flex items-start">
          <span className="text-gray-500 w-32 text-sm flex items-center">
            <CalendarIcon className="h-4 w-4 mr-1" />
            Submitted:
          </span>
          <span className="text-gray-700 text-sm">{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
