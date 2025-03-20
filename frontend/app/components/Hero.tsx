import { Link } from 'react-router';
import { Txt } from '~/cms/Txt';

export function Hero() {
  return (
    <section className="bg-gray-50 py-16 md:py-24">
      <div className="container mx-auto px-4 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          <Txt k={'hero.title'}>
            Discover exclusive investment mandates from family offices worldwide
          </Txt>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mb-10">
          <Txt k={'hero.subtitle'}>
            Connect with qualified investors looking for deals that match their specific investment
            criteria.
          </Txt>
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/mandates"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Browse Mandates
          </Link>
          <Link
            to="/mandate/submit"
            className="bg-white border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Submit Mandate
          </Link>
        </div>
      </div>
    </section>
  );
}
