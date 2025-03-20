import { Link } from 'react-router';
import { useCurrentUser } from '~/context/UserContext';
import { Navbar } from '~/components/Navbar';
import { Footer } from '~/components/Footer';
import { AccessDenied } from '~/admin/components/AccessDenied';
import { AuthRequired } from '~/components/AuthRequired';

export default function AdminIndex() {
  const { user } = useCurrentUser();

  if (!user) {
    return <AuthRequired />;
  }

  const isAdmin = user.roles.includes('ROLE_ADMIN');

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      <Navbar />
      <main className="flex-grow py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MandateManagementCard />
            <InvestorManagementCard />
            <DealManagementCard />
            <TextManagementCard />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function MandateManagementCard() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">Mandates</h2>
      <p className="text-gray-600 mb-4">View, approve, and manage all submitted mandates.</p>
      <Link
        to="/admin/mandates"
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
      >
        View Mandates
      </Link>
    </div>
  );
}

function InvestorManagementCard() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">Investors</h2>
      <p className="text-gray-600 mb-4">View, approve, and manage all registered investors.</p>
      <Link
        to="/admin/investors"
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
      >
        View Investors
      </Link>
    </div>
  );
}

function DealManagementCard() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">Deals</h2>
      <p className="text-gray-600 mb-4">View, approve, and manage all submitted deals.</p>
      <Link
        to="/admin/deals"
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
      >
        View Deals
      </Link>
    </div>
  );
}

function TextManagementCard() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">Website Text</h2>
      <p className="text-gray-600 mb-4">Edit and manage text content throughout the website.</p>
      <Link
        to="/admin/txt"
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
      >
        Manage Text
      </Link>
    </div>
  );
}
