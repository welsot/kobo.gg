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
            <Txt k="contact.title">Contact Us</Txt>
          </h1>
          <article className="prose prose-lg prose-blue max-w-none">
            <Txt k="contact.placeholder2">
              This page will include ways to reach the Mandates.io team, including email addresses,
              phone numbers, and social media links. It may also include a contact form for direct
              inquiries.
            </Txt>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
