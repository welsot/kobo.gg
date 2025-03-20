import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Txt } from '~/cms/Txt';

export function meta() {
  return [
    { title: 'Contact - Mandates.io' },
    { name: 'description', content: 'Get in touch with the Mandates.io team.' },
  ];
}

export default function Contact() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      <Navbar />
      <main className="flex-grow py-10">
        <div className="max-w-3xl mx-auto px-4 py-8 bg-white">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Contact Us
          </h1>
          <article className="prose prose-lg prose-blue max-w-none">
              This page will include ways to reach the Mandates.io team, including email addresses,
              phone numbers, and social media links. It may also include a contact form for direct
              inquiries.
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
