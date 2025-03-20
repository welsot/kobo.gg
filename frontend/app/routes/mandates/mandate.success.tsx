import { Link, useSearchParams } from 'react-router';
import type { MandateDto } from '~/api/apiSchemas';
import { useEffect, useState } from 'react';
import { apiGetMandateById } from '~/api/apiComponents';
import { alertError } from '~/utils/form';
import { MandateSummary } from '~/components/MandateSummary';

export default function MandateSuccessPage() {
  const [loadingMandate, setLoadingMandate] = useState(true);
  const [mandate, setMandate] = useState<MandateDto | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const mandateId = searchParams.get('mandateId');

  const loadMandate = (id: string) => {
    apiGetMandateById({ pathParams: { id: id } })
      .then((response) => {
        setMandate(response.mandate);
      })
      .catch((err) => {
        alertError(err);
      })
      .finally(() => {
        setLoadingMandate(false);
      });
  };

  useEffect(() => {
    if (mandateId) {
      loadMandate(mandateId);
    }
  }, [mandateId]);

  if (loadingMandate) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 bg-white">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 bg-white">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Mandate Submitted Successfully!</h1>
        <p className="text-lg text-gray-600 mb-8">
          Thank you for submitting your mandate. We've received your information and will begin
          matching you with relevant opportunities.
        </p>

        {mandate && <MandateSummary mandate={mandate} className="mb-8" />}

        <div className="space-y-4">
          <p className="text-gray-600">
            You will receive an email confirmation shortly. Our team will review your mandate and
            start identifying matching opportunities.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Link
              to="/mandate/submit"
              className="px-6 py-3 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Submit Another Mandate
            </Link>
            <Link
              to="/dashboard"
              className="px-6 py-3 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
