import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export function meta() {
  return [
    { title: 'About - Mandates.io' },
    { name: 'description', content: 'Learn more about Mandates.io and our mission.' },
  ];
}

export default function About() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      <Navbar />
      <main className="flex-grow py-10">
        <div className="max-w-3xl mx-auto px-4 py-8 bg-white">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            About Mandates.io
          </h1>
          <article className="prose prose-lg prose-blue max-w-none">

            This page will include details about how the platform works, our value proposition for
            investors and deal sponsors, and why we created this service to connect qualified
            investors with matching investment opportunities.

          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
