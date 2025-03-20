import { MandateCard } from './MandateCard';
import { Link } from 'react-router';
import type { PublicMandateDto } from '~/api/apiSchemas';
import { mapPublicMandateToCardProps } from '~/utils/mandate';
import { Txt } from '~/cms/Txt';

type ManadatesPreviewListProps = {
  mandates: PublicMandateDto[];
};

export function MandatesPreviewList({ mandates }: ManadatesPreviewListProps) {
  const mandateCards = mandates.map(mapPublicMandateToCardProps);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            <Txt k={'mandatesPreviewList.title'}>Available Mandates</Txt>
          </h2>
          <p className="text-gray-600 max-w-2xl text-center mb-8">
            <Txt k={'mandatesPreviewList.subtitle'}>
              Browse our curated list of investment mandates from verified family offices and
              institutional investors.
            </Txt>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mandateCards.map((mandate) => (
            <div key={mandate.id} className="flex flex-col">
              <MandateCard {...mandate} />

              <Link
                to={`/mandates/${mandate.id}`}
                className="mt-auto block w-full bg-gray-800 text-white text-center py-2 rounded hover:bg-gray-900 transition"
              >
                View Details
              </Link>
            </div>
          ))}

          {mandateCards.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600">
                <Txt k={'mandatesPreviewList.noResults'}>
                  No mandates found matching your criteria.
                </Txt>
              </p>
            </div>
          )}
        </div>

        {mandateCards.length > 0 && (
          <div className="w-full mx-auto max-w-4xl flex flex-col md:flex-row gap-4 my-8">
            <Link
              to="/mandates"
              prefetch={'intent'}
              className="items-center mx-auto bg-gray-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition"
            >
              View All Mandates
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
