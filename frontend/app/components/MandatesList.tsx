import { useState } from 'react';
import { MandateCard } from './MandateCard';
import { Link } from 'react-router';
import type { PublicMandateDto } from '~/api/apiSchemas';
import { mapPublicMandateToCardProps } from '~/utils/mandate';
import { MandateCTA } from '~/components/MandateCTA';
import { Txt } from '~/cms/Txt';

type ManadatesListProps = {
  mandates: PublicMandateDto[];
};

export function MandatesList({ mandates }: ManadatesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  // Transform API mandates to card props
  const mandateCards = mandates.map(mapPublicMandateToCardProps);

  // Get unique investment types for filter dropdown
  const investmentTypes = Array.from(
    new Set(mandateCards.map((mandate) => mandate.investmentType)),
  );

  // Filter mandates based on search term and filter type
  const filteredMandates = mandateCards.filter((mandate) => {
    const matchesSearch =
      searchTerm === '' ||
      mandate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mandate.investmentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mandate.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterType === '' || mandate.investmentType === filterType;

    return matchesSearch && matchesFilter;
  });

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            <Txt k={'mandatesList.title'}>Available Mandates</Txt>
          </h2>
          <p className="text-gray-600 max-w-2xl text-center mb-8">
            <Txt k={'mandatesList.description'}>
              Browse our curated list of investment mandates from verified family offices and
              institutional investors.
            </Txt>
          </p>

          <div className="w-full max-w-4xl flex flex-col md:flex-row gap-4 mb-8">
            <input
              type="text"
              placeholder="Search mandates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg"
            />

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="md:w-1/3 p-3 border border-gray-300 rounded-lg bg-white"
            >
              <option value="">All Types</option>
              {investmentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <MandateCTA />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMandates.map((mandate) => (
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

          {filteredMandates.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600">
                <Txt k={'mandatesList.noResults'}>No mandates found matching your criteria.</Txt>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
