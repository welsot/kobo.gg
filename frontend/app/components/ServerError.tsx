import { Link } from 'react-router';
import { Footer } from './Footer';
import { Navbar } from './Navbar';
import { LockClosedIcon } from '@heroicons/react/24/outline';


export function ServerError({ error }: { error: any }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col items-center justify-center text-center">
          <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-blue-100">
            <div className="text-blue-600 mb-6">
              <LockClosedIcon className="h-16 w-16 mx-auto" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Server Error
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-8">
                An error occurred while processing your request. Please try again later
            </p>

            <pre
              className={'text-red-600'}
              dangerouslySetInnerHTML={{ __html: JSON.stringify(error) }}
            ></pre>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
