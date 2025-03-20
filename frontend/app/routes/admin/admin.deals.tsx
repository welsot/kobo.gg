import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Navbar } from '~/components/Navbar';
import { Footer } from '~/components/Footer';
import { DealCompatibility } from '~/components/DealSubmission/DealCompatibility';
import { useCurrentUser } from '~/context/UserContext';
import { AccessDenied } from '~/admin/components/AccessDenied';
import {
  apiGetAdminDeals,
  apiGetAdminDealsById,
  apiPostAdminDealsByIdApprove,
  apiPostAdminDealsByIdMatch,
  apiPostAdminDealsByIdReject,
} from '~/api/apiComponents';
import type { AdminDealDto, DealStatusEnum } from '~/api/apiSchemas';
import { alertError } from '~/utils/form';
import { clsx } from 'clsx';
import { format, parseISO } from 'date-fns';
import {
  BuildingOfficeIcon,
  CalendarIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { MandateSummary } from '~/components/MandateSummary';
import { getMandateValueLabel } from '~/utils/mandate';
import { AuthRequired } from '~/components/AuthRequired';

//apiPostAdminDealsByIdMatch()

const getStatusBadgeStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'matched':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

function AdminDealCard({
  adminDeal,
  onViewDetails,
}: {
  adminDeal: AdminDealDto;
  onViewDetails: (id: string) => void;
}) {
  const { deal, dealOwner, mandate, dealId, dealStatus, createdAt } = adminDeal;

  // Format submission date if available
  const formattedDate = createdAt ? format(parseISO(createdAt), 'MMM d, yyyy') : 'N/A';

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 mb-4">
      <div className="grid grid-cols-6 gap-4">
        <div className="col-span-2">
          <h3 className="font-semibold">{deal.description || 'Unnamed Deal'}</h3>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <UserCircleIcon className="h-4 w-4 mr-1" />
            <span>{dealOwner.name}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <EnvelopeIcon className="h-4 w-4 mr-1" />
            <span>{dealOwner.email}</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Investment Strategy</p>
          <p className="text-sm">
            {getMandateValueLabel('investmentStrategy', mandate.investmentStrategy || 'other')}
          </p>
          <p className="text-sm font-medium text-gray-500 mt-1">Submitted</p>
          <p className="text-sm">{formattedDate}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Mandate ID</p>
          <p className="text-sm">{mandate?.mandateId || 'N/A'}</p>
          <p className="text-sm font-medium text-gray-500 mt-1">Investor</p>
          <p className="text-sm">{mandate?.contactInfo?.name || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Status</p>
          <span
            className={`inline-block py-1 px-2 text-xs font-medium rounded-full ${getStatusBadgeStyle(dealStatus)}`}
          >
            {dealStatus.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center justify-end">
          <button
            onClick={() => onViewDetails(dealId)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

function DealDetailsModal({
  dealId,
  onClose,
  onApprove,
  onReject,
  onMatch,
  updating,
}: {
  dealId: string;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onMatch: (id: string) => void;
  updating: boolean;
}) {
  const [adminDeal, setAdminDeal] = useState<AdminDealDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDealDetails() {
      try {
        setLoading(true);
        const response = await apiGetAdminDealsById({
          pathParams: { id: dealId },
        });
        setAdminDeal(response.deal);
      } catch (err) {
        setError('Failed to load deal details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchDealDetails();
  }, [dealId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-3/4 h-5/6 overflow-auto relative">
          <p className="text-center">Loading deal details...</p>
        </div>
      </div>
    );
  }

  if (error || !adminDeal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-3/4 h-5/6 overflow-auto relative">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold">Error</h2>
            <button className="text-gray-600 hover:text-gray-800" onClick={onClose}>
              &times;
            </button>
          </div>
          <p>{error || 'Failed to load deal details'}</p>
        </div>
      </div>
    );
  }

  const { deal, dealOwner, mandate, dealStatus, createdAt } = adminDeal;
  const canApproveReject = dealStatus === 'pending';
  const canMatch = dealStatus !== 'matched'; // Can match as long as it's not already matched

  // Format dates
  const submittedDate = createdAt ? format(parseISO(createdAt), 'MMMM d, yyyy') : 'Not available';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-3/4 h-5/6 overflow-auto relative">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Deal Details</h2>
          <button className="text-gray-600 hover:text-gray-800" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Status badge */}
        <div className="mb-6">
          <span
            className={`inline-block py-1 px-3 text-sm font-medium rounded-full ${getStatusBadgeStyle(dealStatus)}`}
          >
            {dealStatus.toUpperCase()}
          </span>
          <span className="ml-4 text-gray-500 flex items-center inline-block">
            <CalendarIcon className="h-4 w-4 mr-1" />
            Submitted: {submittedDate}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Contact Information Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Deal Owner Information</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <UserCircleIcon className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p>{dealOwner.name}</p>
                </div>
              </div>
              <div className="flex items-start">
                <EnvelopeIcon className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p>{dealOwner.email}</p>
                </div>
              </div>
              <div className="flex items-start">
                <PhoneIcon className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p>{dealOwner.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <BuildingOfficeIcon className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Role</p>
                  <p>{dealOwner.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Investor/Mandate Contact Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Investor Information</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <UserCircleIcon className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p>{mandate?.contactInfo?.name || 'Not available'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <EnvelopeIcon className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p>{mandate?.contactInfo?.email || 'Not available'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <PhoneIcon className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p>{mandate?.contactInfo?.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <DocumentTextIcon className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Mandate ID</p>
                  <p>{mandate?.mandateId || 'Not available'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deal Information Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <MandateSummary mandate={mandate} />
        </div>

        {/* Notes Section */}
        {deal.notes && Object.keys(deal.notes).length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Additional Notes</h3>
            <div className="space-y-3">
              {Object.entries(deal.notes).map(([key, value]) => (
                <div key={key}>
                  <p className="text-sm font-medium text-gray-500">{key}</p>
                  <p>{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* File Attachments Section */}
        {adminDeal.files && adminDeal.files.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">
              File Attachments ({adminDeal.files.length})
            </h3>
            <div className="space-y-3">
              {adminDeal.files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b border-gray-100 pb-2"
                >
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-5 w-5 mr-3 text-gray-500" />
                    <span className="text-sm truncate max-w-md">{file.filename}</span>
                  </div>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition text-sm font-medium"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compatibility assessment */}
        {mandate && deal && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Deal-Mandate Compatibility</h3>
            <DealCompatibility deal={deal} mandate={mandate} />
          </div>
        )}

        <div className="flex justify-center gap-4 mt-6">
          {canApproveReject && (
            <>
              <button
                onClick={() => onApprove(dealId)}
                disabled={updating}
                className={clsx(
                  'px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition cursor-pointer',
                  updating && 'opacity-50 cursor-not-allowed',
                )}
              >
                Approve
              </button>
              <button
                onClick={() => onReject(dealId)}
                disabled={updating}
                className={clsx(
                  'px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition cursor-pointer',
                  updating && 'opacity-50 cursor-not-allowed',
                )}
              >
                Reject
              </button>
            </>
          )}
          {canMatch && (
            <button
              onClick={() => onMatch(dealId)}
              disabled={updating}
              className={clsx(
                'px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition cursor-pointer',
                updating && 'opacity-50 cursor-not-allowed',
              )}
            >
              Match
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDeals() {
  const { user } = useCurrentUser();
  const navigate = useNavigate();

  const [deals, setDeals] = useState<AdminDealDto[]>([]);
  const [activeTab, setActiveTab] = useState<DealStatusEnum>('pending');
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [updatingDeal, setUpdatingDeal] = useState(false);

  useEffect(() => {
    fetchDeals();
  }, [user]);

  async function fetchDeals() {
    try {
      setLoading(true);
      const response = await apiGetAdminDeals();
      setDeals(response.deals);
    } catch (err) {
      setError('Failed to load deals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleApproveDeal(id: string) {
    setUpdatingDeal(true);
    apiPostAdminDealsByIdApprove({ pathParams: { id: id } })
      .then((res) => {
        setDeals((oldDeals) => {
          return oldDeals.map((deal) => {
            if (deal.dealId === id) {
              return res.deal;
            }
            return deal;
          });
        });
        setSelectedDealId(null);
      })
      .catch((err) => {
        alertError(err);
      })
      .finally(() => {
        setUpdatingDeal(false);
      });
  }

  function handleRejectDeal(id: string) {
    setUpdatingDeal(true);
    apiPostAdminDealsByIdReject({ pathParams: { id: id } })
      .then((res) => {
        setDeals((oldDeals) => {
          return oldDeals.map((deal) => {
            if (deal.dealId === id) {
              return res.deal;
            }
            return deal;
          });
        });
        setSelectedDealId(null);
      })
      .catch((err) => {
        alertError(err);
      })
      .finally(() => {
        setUpdatingDeal(false);
      });
  }

  function handleMatchDeal(id: string) {
    setUpdatingDeal(true);
    apiPostAdminDealsByIdMatch({ pathParams: { id: id } })
      .then((res) => {
        setDeals((oldDeals) => {
          return oldDeals.map((deal) => {
            if (deal.dealId === id) {
              return res.deal;
            }
            return deal;
          });
        });
        setSelectedDealId(null);
      })
      .catch((err) => {
        alertError(err);
      })
      .finally(() => {
        setUpdatingDeal(false);
      });
  }

  // Filter deals based on active tab
  const filteredDeals = deals.filter((deal) => deal.dealStatus === activeTab);

  // If user is not authenticated, navigate to login would handle this
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
            - Deals
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
                  activeTab === 'approved'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('approved')}
              >
                Approved
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'matched'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('matched')}
              >
                Matched
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'rejected'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('rejected')}
              >
                Rejected
              </button>
            </nav>
          </div>

          {/* Content */}
          {loading ? (
            <p>Loading deals...</p>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded border border-red-200">{error}</div>
          ) : filteredDeals.length === 0 ? (
            <p>No {activeTab} deals found.</p>
          ) : (
            <div className="space-y-4">
              {filteredDeals.map((deal) => (
                <AdminDealCard
                  key={deal.dealId}
                  adminDeal={deal}
                  onViewDetails={(id) => setSelectedDealId(id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal for viewing deal details */}
      {selectedDealId && (
        <DealDetailsModal
          dealId={selectedDealId}
          onClose={() => setSelectedDealId(null)}
          onApprove={handleApproveDeal}
          onReject={handleRejectDeal}
          onMatch={handleMatchDeal}
          updating={updatingDeal}
        />
      )}

      <Footer />
    </div>
  );
}
