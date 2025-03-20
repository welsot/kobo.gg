import type { Route } from './+types/home';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { Footer } from '../components/Footer';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Kobo.gg' },
    {
      name: 'description',
      content:
        '',
    },
  ];
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Hero />
      </main>
      <Footer />
    </div>
  );
}
