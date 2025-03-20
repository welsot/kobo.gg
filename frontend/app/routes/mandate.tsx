import type { LoaderFunctionArgs } from 'react-router';
import { Link, useLoaderData } from 'react-router';
import { PublicMandateSummary } from '~/components/PublicMandateSummary';
import { serverFetch } from '~/utils/serverFetch';
import type { GetPublicMandateByIdResponse } from '~/api/apiSchemas';
import { Navbar } from '~/components/Navbar';
import { Footer } from '~/components/Footer';

export async function loader({ params, request }: LoaderFunctionArgs) {
  const mandateId = params.uuid;
  if (!mandateId) {
    return { mandate: null, error: 'Mandate ID is required' };
  }

  try {
    const { data, error, status } = await serverFetch<GetPublicMandateByIdResponse>(
      `/api/v1/mandate/${mandateId}/public`,
      request,
    );

    if (!data || error) {
      console.error('Error loading mandate:', error);
      return { mandate: null, error: 'Failed to load mandate', status };
    }

    return { mandate: data.mandate, error: null };
  } catch (error) {
    console.error('Error loading mandate:', error);
    return { mandate: null, error: 'An error occurred while loading the mandate' };
  }
}

export default function MandateDetail() {
  const data = useLoaderData<typeof loader>();
  const { mandate, error } = data;

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
              <p>{error}</p>
            </div>
            <Link
              to="/mandates"
              className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
            >
              Back to Mandates
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!mandate) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg mb-4">
              <p>Mandate not found</p>
            </div>
            <Link
              to="/mandates"
              className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
            >
              Back to Mandates
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <Link
              to="/mandates"
              className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
            >
              ← Back to Mandates
            </Link>
            <Link
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded"
              to={`/mandates/${mandate.id}/submit-deal`}
            >
              Submit Deal
            </Link>
          </div>

          <PublicMandateSummary mandate={mandate} className="mb-8" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
