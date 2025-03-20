import { Link } from 'react-router';
import { Txt } from '~/cms/Txt';

export interface MandateCardProps {
  id: string;
  title: string;
  investmentType: string;
  checkSize: string;
  location: string;
  targetReturn: string;
  additionalDetails: string;
}

export function MandateCard({
  id,
  title,
  investmentType,
  checkSize,
  location,
  targetReturn,
  additionalDetails,
}: MandateCardProps) {
  return (
    <div className="flex flex-col bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow grow mb-4">
      <h3 className="font-semibold text-lg text-gray-900 mb-2">{title}</h3>

      <div className="space-y-2 mb-4">
        <div className="flex items-start">
          <span className="text-gray-500 w-32 text-sm">
            <Txt k={'mandateCard.investmentType'}>Investment Type:</Txt>
          </span>
          <span className="text-gray-700 text-sm">{investmentType}</span>
        </div>

        <div className="flex items-start">
          <span className="text-gray-500 w-32 text-sm">
            <Txt k={'mandateCard.checkSize'}>Check Size:</Txt>
          </span>
          <span className="text-gray-700 text-sm">{checkSize}</span>
        </div>

        <div className="flex items-start">
          <span className="text-gray-500 w-32 text-sm">
            <Txt k={'mandateCard.location'}>Location:</Txt>
          </span>
          <span className="text-gray-700 text-sm">{location}</span>
        </div>

        <div className="flex items-start">
          <span className="text-gray-500 w-32 text-sm">
            <Txt k={'mandateCard.targetReturn'}>Target Return:</Txt>
          </span>
          <span className="text-gray-700 text-sm">{targetReturn}</span>
        </div>

        {additionalDetails && (
          <div className="flex flex-col">
            <span className="text-gray-500 text-sm mb-1">
              <Txt k={'mandateCard.additionalDetails'}>Additional Details:</Txt>
            </span>
            <span className="text-gray-700 text-sm">
              {additionalDetails.length > 200 ? (
                <>
                  {additionalDetails.slice(0, 200)}...
                  <Link to={`/mandates/${id}`} className="text-blue-600 hover:underline ml-1">
                    See more
                  </Link>
                </>
              ) : (
                additionalDetails
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
