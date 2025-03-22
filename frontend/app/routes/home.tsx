import type { Route } from './+types/home';
import { Hero } from '~/components/Hero';
import { Footer } from '~/components/Footer';
import { redirect, useLoaderData } from 'react-router';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Kobo.gg' },
    {
      name: 'description',
      content: 'Download your ebooks easily',
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const ua = request.headers.get('User-Agent');

  if (!ua) return { ua: '(empty)' };

  console.log('ua', ua);

  const lcUa = ua.toLowerCase();
  const isEReader = lcUa.includes('kobo') || lcUa.includes('kindle');
  console.log('isEReader', isEReader);
  if (!isEReader) return { ua: ua };

  return redirect('/ereader');
}

export default function Home() {
  const { ua } = useLoaderData();
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <Hero />
      </main>
      <div className="text-center text-gray-700 text-xl">
        UserAgent: {ua}
      </div>
      <Footer />
    </div>
  );
}
