import { BookUploader } from './BookUploader';
import { ShortCodeInput } from '~/components/ShortCodeInput';

export function Hero() {
  return (
    <section className="bg-gradient-to-b from-purple-50 to-white py-16 md:py-24">
      <div className="container mx-auto px-4 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-purple-900 mb-6">
          Kobo.gg
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mb-10">
          Send files to your Kobo reader and get instant access to your
          favourite books.
        </p>

        <ShortCodeInput />
        
        <BookUploader />
      </div>
    </section>
  );
}

