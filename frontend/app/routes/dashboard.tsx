import { mapMandateToCardProps } from '~/utils/mandate';
import { MandateCard } from '~/components/MandateCard';
import { UserDealCard } from '~/components/UserDealCard';
import type { MandateDto, UserDealDto } from '~/api/apiSchemas';
import { Link } from 'react-router';
import { Navbar } from '~/components/Navbar';
import { Footer } from '~/components/Footer';
import { useEffect, useState } from 'react';
import { apiGetDeals, apiGetInvestorMandates } from '~/api/apiComponents';
import { useCurrentUser } from '~/context/UserContext';
import { AuthRequired } from '~/components/AuthRequired';

export default function Dashboard() {
  const { user } = useCurrentUser();

  if (!user) {
    return <AuthRequired />;
  }

  const [mandates, setMandates] = useState<MandateDto[]>([]);
  const [deals, setDeals] = useState<UserDealDto[]>([]);
  const [isLoadingMandates, setIsLoadingMandates] = useState(true);
  const [isLoadingDeals, setIsLoadingDeals] = useState(true);

  useEffect(() => {
    // Fetch mandates
    apiGetInvestorMandates()
      .then((res) => {
        setMandates(res.mandates);
      })
      .catch((err) => {
        console.error('Error fetching mandates:', err);
      })
      .finally(() => {
        setIsLoadingMandates(false);
      });

    // Fetch deals
    apiGetDeals()
      .then((res) => {
        setDeals(res.deals);
      })
      .catch((err) => {
        console.error('Error fetching deals:', err);
      })
      .finally(() => {
        setIsLoadingDeals(false);
      });
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Mandates Section */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Your Mandates</h1>
              <Link
                prefetch="intent"
                to="/mandate/submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
              >
                Submit New Mandate
              </Link>
            </div>

            {isLoadingMandates ? (
              <LoadingState type="mandates" />
            ) : (
              <MandatesContent mandates={mandates} />
            )}
          </div>

          {/* Deals Section */}
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Submitted Deals</h1>
              <Link
                prefetch="intent"
                to="/mandates"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition-colors"
              >
                Find Mandates
              </Link>
            </div>

            {isLoadingDeals ? <LoadingState type="deals" /> : <DealsContent deals={deals} />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function LoadingState({ type = 'mandates' }: { type?: 'mandates' | 'deals' }) {
  const message = type === 'mandates' ? 'Fetching your mandates' : 'Fetching your submitted deals';

  return (
    <div className="bg-white rounded-lg shadow-md p-10 border border-gray-100 text-center">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Loading...</h2>
      <p className="text-gray-600 mb-8">{message}. Please wait...</p>
    </div>
  );
}

function MandatesContent({ mandates }: { mandates: MandateDto[] }) {
  if (mandates.length === 0) {
    return <EmptyMandatesState />;
  }

  return <MandatesDashboardList mandates={mandates} />;
}

function DealsContent({ deals }: { deals: UserDealDto[] }) {
  if (deals.length === 0) {
    return <EmptyDealsState />;
  }

  return <DealsDashboardList deals={deals} />;
}

function EmptyMandatesState() {
  return (
    <div className="bg-white rounded-lg shadow-md p-10 border border-gray-100 text-center">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">No Mandates Found</h2>
      <p className="text-gray-600 mb-8">
        You haven't submitted any mandates yet. Create your first mandate to start connecting with
        investment opportunities.
      </p>
      <Link
        prefetch="intent"
        to="/mandate/submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors inline-block font-medium"
      >
        Submit Your First Mandate
      </Link>
    </div>
  );
}

function EmptyDealsState() {
  return (
    <div className="bg-white rounded-lg shadow-md p-10 border border-gray-100 text-center">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">No Deals Submitted</h2>
      <p className="text-gray-600 mb-8">
        You haven't submitted any deals yet. Browse available mandates to find investment
        opportunities.
      </p>
      <Link
        prefetch="intent"
        to="/mandates"
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md transition-colors inline-block font-medium"
      >
        Browse Mandates
      </Link>
    </div>
  );
}

function MandatesDashboardList({ mandates }: { mandates: MandateDto[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mandates.map((mandate: MandateDto) => (
        <Link
          prefetch="intent"
          to={`/mandates/${mandate.mandateId}`}
          key={mandate.mandateId}
          className="block hover:no-underline"
        >
          <MandateCard {...mapMandateToCardProps(mandate)} />
        </Link>
      ))}
    </div>
  );
}

function DealsDashboardList({ deals }: { deals: UserDealDto[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {deals.map((deal) => (
        <div key={deal.dealId} className="block">
          <UserDealCard userDeal={deal} />
        </div>
      ))}
    </div>
  );
}
