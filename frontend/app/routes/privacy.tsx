import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';


export function meta() {
  return [
    { title: 'Privacy Policy - Mandates.io' },
    { name: 'description', content: 'Privacy Policy' },
  ];
}

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      <Navbar />
      <main className="flex-grow py-10">
        <div className="max-w-3xl mx-auto px-4 py-8 bg-white">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Privacy Policy
          </h1>
          <div className="prose prose-blue max-w-none">
            <p className="text-lg text-gray-700 mb-4">
              ...
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
