import { DealFormContainer } from '~/components/DealSubmission';
import { Navbar } from '~/components/Navbar';
import { Footer } from '~/components/Footer';
import { type LoaderFunctionArgs, useLoaderData } from 'react-router';
import { serverFetch } from '~/utils/serverFetch';
import type { GetPublicMandateByIdResponse } from '~/api/apiSchemas';
import { ServerError } from '~/components/ServerError';

export function meta() {
  return [
    { title: 'Submit a Deal' },
    {
      name: 'description',
      content:
        'Submit your deal to Mandates.io and connect with investors looking for opportunities that match your criteria.',
    },
  ];
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const mandateId = params.uuid;

  if (!mandateId) {
    return { mandate: null, error: 'Mandate ID is required' };
  }

  const { data, error } = await serverFetch<GetPublicMandateByIdResponse>(
    `/api/v1/mandate/${mandateId}/public`,
    request,
  );

  if (!data || error) {
    console.error('Error loading mandate:', error);
    return { mandate: null, error: error };
  }

  return data;
}

export default function MandateSubmitDealPage() {
  const data = useLoaderData<GetPublicMandateByIdResponse & { error: any }>();

  if (!data.mandate || data.error) {
    return <ServerError error={data.error || 'Unexpected error'} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      <Navbar />
      <main className="flex-grow py-10">
        <DealFormContainer mandate={data.mandate} />
      </main>
      <Footer />
    </div>
  );
}
