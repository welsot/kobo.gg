import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Navbar } from '~/components/Navbar';
import { Footer } from '~/components/Footer';
import { MandateSummary } from '~/components/MandateSummary';
import { useCurrentUser } from '~/context/UserContext';
import { AccessDenied } from '~/admin/components/AccessDenied';
import {
  apiGetAdminMandates,
  apiGetMandateById,
  apiPostAdminMandatesByIdApprove,
  apiPostAdminMandatesByIdDecline,
} from '~/api/apiComponents';
import type { MandateDto, MandateStatusEnum } from '~/api/apiSchemas';
import { getMandateValueLabel } from '~/utils/mandate';
import { alertError } from '~/utils/form';
import { clsx } from 'clsx';
import { AuthRequired } from '~/components/AuthRequired';

const getStatusBadgeStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'text-green-800';
    case 'declined':
      return 'text-red-800';
    case 'pending':
      return 'text-yellow-800';
    default:
      return 'text-gray-800';
  }
};

function AdminMandateCard({
  mandate,
  onViewDetails,
}: {
  mandate: MandateDto;
  onViewDetails: (id: string) => void;
}) {
  const strategy = mandate.investmentStrategy
    ? getMandateValueLabel('investmentStrategy', mandate.investmentStrategy)
    : 'N/A';

  // Get check size based on investment strategy
  let checkSize = 'N/A';
  if (mandate.realEstate?.checkSize) {
    checkSize = getMandateValueLabel('realEstateCheckSize', mandate.realEstate.checkSize) || 'N/A';
  } else if (mandate.privateEquity?.checkSize) {
    checkSize =
      getMandateValueLabel('privateEquityCheckSize', mandate.privateEquity.checkSize) || 'N/A';
  } else if (mandate.funds?.checkSize) {
    checkSize = getMandateValueLabel('fundCheckSize', mandate.funds.checkSize) || 'N/A';
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 mb-4">
      <div className="grid grid-cols-6 gap-4">
        {' '}
        {/* Changed from grid-cols-5 to grid-cols-6 */}
        <div className="col-span-2">
          <h3 className="font-semibold">{mandate.contactInfo.name}</h3>
          <p className="text-sm text-gray-600">{mandate.contactInfo.email}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Investment Strategy</p>
          <p className="text-sm">{strategy}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Check Size</p>
          <p className="text-sm">{checkSize}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Status</p>
          <span
            className={`inline-block py-1 text-xs font-medium rounded-full ${getStatusBadgeStyle(
              mandate.status || 'pending',
            )}`}
          >
            {mandate.status.toUpperCase() || 'PENDING'}
          </span>
        </div>
        <div className="flex items-center justify-end">
          <button
            onClick={() => onViewDetails(mandate.mandateId)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

function MandateDetailsModal({
  mandateId,
  onClose,
  onApprove,
  onDecline,
  updating,
}: {
  mandateId: string;
  onClose: () => void;
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
  updating: boolean;
}) {
  const [mandate, setMandate] = useState<MandateDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMandate() {
      try {
        setLoading(true);
        const response = await apiGetMandateById({
          pathParams: { id: mandateId },
        });
        setMandate(response.mandate);
      } catch (err) {
        setError('Failed to load mandate details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchMandate();
  }, [mandateId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-3/4 h-5/6 overflow-auto relative">
          <p className="text-center">Loading mandate details...</p>
        </div>
      </div>
    );
  }

  if (error || !mandate) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-3/4 h-5/6 overflow-auto relative">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold">Error</h2>
            <button className="text-gray-600 hover:text-gray-800" onClick={onClose}>
              &times;
            </button>
          </div>
          <p>{error || 'Failed to load mandate details'}</p>
        </div>
      </div>
    );
  }

  const canApproveReject = true;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-3/4 h-5/6 overflow-auto relative">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Mandate Details</h2>
          <button className="text-gray-600 hover:text-gray-800" onClick={onClose}>
            &times;
          </button>
        </div>

        <MandateSummary mandate={mandate} />

        {canApproveReject && (
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => onApprove(mandateId)}
              disabled={updating}
              className={clsx(
                'px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition cursor-pointer',
                updating && 'opacity-50 cursor-not-allowed',
              )}
            >
              Approve
            </button>
            <button
              onClick={() => onDecline(mandateId)}
              disabled={updating}
              className={clsx(
                'px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition cursor-pointer',
                updating && 'opacity-50 cursor-not-allowed',
              )}
            >
              Decline
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminMandates() {
  const { user } = useCurrentUser();

  const [mandates, setMandates] = useState<MandateDto[]>([]);
  const [activeTab, setActiveTab] = useState<MandateStatusEnum>('pending');
  const [selectedMandateId, setSelectedMandateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [updatingMandate, setUpdatingMandate] = useState(false);

  useEffect(() => {
    fetchMandates();
  }, [user]);

  async function fetchMandates() {
    try {
      setLoading(true);
      const response = await apiGetAdminMandates();
      setMandates(response.mandates);
    } catch (err) {
      setError('Failed to load mandates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleApproveMandate(id: string) {
    setUpdatingMandate(true);
    apiPostAdminMandatesByIdApprove({ pathParams: { id: id } })
      .then((res) => {
        setMandates((oldMandates) => {
          return oldMandates.map((mandate) => {
            if (mandate.mandateId === id) {
              return res.mandate;
            }
            return mandate;
          });
        });
        setSelectedMandateId(null);
      })
      .catch((err) => {
        alertError(err);
      })
      .finally(() => {
        setUpdatingMandate(false);
      });
  }

  function handleDeclineMandate(id: string) {
    setUpdatingMandate(true);
    apiPostAdminMandatesByIdDecline({ pathParams: { id: id } })
      .then((res) => {
        setMandates((oldMandates) => {
          return oldMandates.map((mandate) => {
            if (mandate.mandateId === id) {
              return res.mandate;
            }
            return mandate;
          });
        });
        setSelectedMandateId(null);
      })
      .catch((err) => {
        alertError(err);
      })
      .finally(() => {
        setUpdatingMandate(false);
      });
  }

  // Filter mandates based on active tab
  const filteredMandates = mandates.filter((mandate) => mandate.status === activeTab);

  if (!user) {
    return <AuthRequired />;
  }

  // If user doesn't have the admin role, show access denied
  if (!user.roles.includes('ROLE_ADMIN')) {
    return <AccessDenied />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      <Navbar />

      <main className={'flex-grow py-10'}>
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold mb-6">
            <Link to={'/admin'} className={'text-blue-600 hover:underline'}>
              Admin Dashboard
            </Link>{' '}
            - Mandates
          </h1>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('pending')}
              >
                Pending Review
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'active'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('active')}
              >
                Approved
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'declined'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('declined')}
              >
                Declined
              </button>
            </nav>
          </div>

          {/* Content */}
          {loading ? (
            <p>Loading mandates...</p>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded border border-red-200">{error}</div>
          ) : filteredMandates.length === 0 ? (
            <p>No {activeTab} mandates found.</p>
          ) : (
            <div className="space-y-4">
              {filteredMandates.map((mandate) => (
                <AdminMandateCard
                  key={mandate.mandateId}
                  mandate={mandate}
                  onViewDetails={(id) => setSelectedMandateId(id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal for viewing mandate details */}
      {selectedMandateId && (
        <MandateDetailsModal
          mandateId={selectedMandateId}
          onClose={() => setSelectedMandateId(null)}
          onApprove={handleApproveMandate}
          onDecline={handleDeclineMandate}
          updating={updatingMandate}
        />
      )}

      <Footer />
    </div>
  );
}
