import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router';
import { StaticLayout } from '~/components/StaticLayout';

export default function InvestorRegisterSuccessPage() {
  return (
    <StaticLayout>
      <div className="container mx-auto py-8">
        <div className="max-w-3xl mx-auto px-4 py-16 bg-white">
          <div className="text-center">
            <div className="flex justify-center items-center mb-6">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Registration Completed Successfully!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Would you like to post a mandate? (2-5 minutes)
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/mandate/submit"
                prefetch={'render'}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Submit a Mandate
              </Link>
              <Link
                to="/dashboard"
                prefetch={'render'}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </StaticLayout>
  );
}
