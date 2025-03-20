import { Navbar } from '~/components/Navbar';
import { Footer } from '~/components/Footer';
import { Txt } from '~/cms/Txt';

export function AccessDenied() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      <Navbar />
      <main className="flex-grow py-10">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
            <h2 className="text-lg font-semibold mb-2">
              Access Denied
            </h2>
            <p>
              You do not have permission to access this area.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
