import type { Route } from './+types/home';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { FAQ } from '../components/FAQ';
import { Footer } from '../components/Footer';
import { serverFetch } from '~/utils/serverFetch';
import type { GetPublicMandatesResponse } from '~/api/apiSchemas';
import { useLoaderData } from 'react-router';
import { MandatesPreviewList } from '~/components/MandatesPreviewList';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Mandates.io - Connect with Qualified Investors' },
    {
      name: 'description',
      content:
        'Discover exclusive investment mandates from family offices worldwide and connect with qualified investors looking for deals that match their criteria.',
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const { data, error } = await serverFetch<GetPublicMandatesResponse>('/api/v1/mandates', request);

  if (!data || error) {
    console.error('Error loading mandates:', error);
    return { mandates: [] };
  }

  return data;
}

export default function Home() {
  const response = useLoaderData<typeof loader>();

  const mandates = response?.mandates || [];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <MandatesPreviewList mandates={mandates} />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
