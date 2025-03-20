import type { LoaderFunctionArgs } from 'react-router';
import { useLoaderData } from 'react-router';
import { serverFetch } from '~/utils/serverFetch';
import { MandatesList } from '~/components/MandatesList';
import type { GetPublicMandatesResponse } from '~/api/apiSchemas';
import { Navbar } from '~/components/Navbar';
import { Footer } from '~/components/Footer';

export async function loader({ request }: LoaderFunctionArgs) {
  const { data, error } = await serverFetch<GetPublicMandatesResponse>('/api/v1/mandates', request);

  if (!data || error) {
    console.error('Error loading mandates:', error);
    return { mandates: [] };
  }

  return data;
}

export default function Mandates() {
  const data = useLoaderData<typeof loader>();
  const mandates = data?.mandates || [];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <MandatesList mandates={mandates} />
      </main>
      <Footer />
    </div>
  );
}
