import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Navbar } from '~/components/Navbar';
import { Footer } from '~/components/Footer';
import { useCurrentUser } from '~/context/UserContext';
import { AccessDenied } from '~/admin/components/AccessDenied';
import {
  apiGetAdminInvestors,
  apiGetAdminInvestorsById,
  apiPostAdminInvestorsByIdApprove,
  apiPostAdminInvestorsByIdReject,
} from '~/api/apiComponents';
import type { InvestorFullProfileDto, InvestorProfileStatusEnum } from '~/api/apiSchemas';
import { getInvestorValueLabel } from '~/utils/investor';
import { AuthRequired } from '~/components/AuthRequired';

function InvestorProfileCard({
  investor,
  onViewDetails,
}: {
  investor: InvestorFullProfileDto;
  onViewDetails: (id: string) => void;
}) {
  const fullName = `${investor.profile.fullName.firstName} ${investor.profile.fullName.lastName}`;
  const investorType = investor.profile.investorType
    ? getInvestorValueLabel('investorType', investor.profile.investorType)
    : 'N/A';
  const accreditedStatus = investor.profile.accreditedInvestorStatus
    ? getInvestorValueLabel('accreditedStatus', investor.profile.accreditedInvestorStatus)
    : 'N/A';
  const netWorth = investor.profile.netWorth
    ? getInvestorValueLabel('netWorth', investor.profile.netWorth)
    : 'N/A';

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 mb-4">
      <div className="grid grid-cols-6 gap-4">
        <div className="col-span-2">
          <h3 className="font-semibold">{fullName}</h3>
          <p className="text-sm text-gray-600">{investor.user.email}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Investor Type</p>
          <p className="text-sm">{investorType}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Accreditation</p>
          <p className="text-sm">{accreditedStatus}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Net Worth</p>
          <p className="text-sm">{netWorth}</p>
        </div>
        <div className="flex items-center justify-end">
          <button
            onClick={() => onViewDetails(investor.user.id)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

function InvestorDetailsModal({
  investorId,
  onClose,
  onApprove,
  onReject,
  canApproveReject,
}: {
  investorId: string;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  canApproveReject: boolean;
}) {
  const [investor, setInvestor] = useState<InvestorFullProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInvestor() {
      try {
        setLoading(true);
        const response = await apiGetAdminInvestorsById({
          pathParams: { id: investorId },
        });
        setInvestor(response.investor);
      } catch (err) {
        setError('Failed to load investor details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchInvestor();
  }, [investorId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-3/4 h-5/6 overflow-auto relative">
          <p className="text-center">Loading investor details...</p>
        </div>
      </div>
    );
  }

  if (error || !investor) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-3/4 h-5/6 overflow-auto relative">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold">Error</h2>
            <button className="text-gray-600 hover:text-gray-800" onClick={onClose}>
              &times;
            </button>
          </div>
          <p>{error || 'Failed to load investor details'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-3/4 h-5/6 overflow-auto relative">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Investor Profile Details</h2>
          <button className="text-gray-600 hover:text-gray-800" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 text-left border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Investor Summary</h2>

          <div className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Status:</span> {investor.status}
                </div>
                <div>
                  <span className="font-medium">Full Name:</span>{' '}
                  {investor.profile.fullName.firstName} {investor.profile.fullName.lastName}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {investor.user.email}
                </div>
                {investor.profile.phoneNumber && (
                  <div>
                    <span className="font-medium">Phone:</span> {investor.profile.phoneNumber}
                  </div>
                )}
                {investor.profile.countryOfResidence && (
                  <div>
                    <span className="font-medium">Country:</span>{' '}
                    {investor.profile.countryOfResidence.country}
                  </div>
                )}
                {investor.profile.stateOfResidence && (
                  <div>
                    <span className="font-medium">State:</span> {investor.profile.stateOfResidence}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {investor.profile.investorType && (
                  <div>
                    <span className="font-medium">Investor Type:</span>{' '}
                    {getInvestorValueLabel('investorType', investor.profile.investorType)}
                  </div>
                )}
                {investor.profile.referralSource && (
                  <div>
                    <span className="font-medium">Referral Source:</span>{' '}
                    {getInvestorValueLabel('referralSource', investor.profile.referralSource)}
                  </div>
                )}
                {investor.profile.linkedinUrl && (
                  <div>
                    <span className="font-medium">LinkedIn:</span>{' '}
                    <a
                      href={investor.profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {investor.profile.linkedinUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Accreditation Information */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium mb-2">Accreditation Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {investor.profile.accreditedInvestorStatus && (
                  <div>
                    <span className="font-medium">Accredited Status:</span>{' '}
                    {getInvestorValueLabel(
                      'accreditedStatus',
                      investor.profile.accreditedInvestorStatus,
                    )}
                  </div>
                )}
                <div>
                  <span className="font-medium">Accreditation Confirmed:</span>{' '}
                  {investor.profile.accreditationConfirmation ? 'Yes' : 'No'}
                </div>
              </div>
            </div>

            {/* Investment Experience */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium mb-2">Investment Experience & Capacity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {investor.profile.lpInvestingExperience && (
                  <div>
                    <span className="font-medium">LP Investment Experience:</span>{' '}
                    {getInvestorValueLabel(
                      'dealExperience',
                      investor.profile.lpInvestingExperience,
                    )}
                  </div>
                )}
                {investor.profile.deployedAmount && (
                  <div>
                    <span className="font-medium">Deployed Amount:</span>{' '}
                    {getInvestorValueLabel('deployedAmount', investor.profile.deployedAmount)}
                  </div>
                )}
                {investor.profile.expectedDeploymentAmount && (
                  <div>
                    <span className="font-medium">Expected Deployment Amount:</span>{' '}
                    {getInvestorValueLabel(
                      'futureDeployment',
                      investor.profile.expectedDeploymentAmount,
                    )}
                  </div>
                )}
                {investor.profile.netWorth && (
                  <div>
                    <span className="font-medium">Net Worth:</span>{' '}
                    {getInvestorValueLabel('netWorth', investor.profile.netWorth)}
                  </div>
                )}
              </div>
            </div>

            {/* Legal Acknowledgements */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium mb-2">Legal Acknowledgements</h3>
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <span className="font-medium">No Alternative Use:</span>{' '}
                  {investor.profile.acceptedNoAlternativeUse ? 'Accepted' : 'Not Accepted'}
                </div>
                <div>
                  <span className="font-medium">Risk Acknowledgement:</span>{' '}
                  {investor.profile.acceptedRiskAcknowledgement ? 'Accepted' : 'Not Accepted'}
                </div>
                <div>
                  <span className="font-medium">Legal Acknowledgement:</span>{' '}
                  {investor.profile.acceptedLegalAcknowledgement ? 'Accepted' : 'Not Accepted'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {canApproveReject && (
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => onApprove(investorId)}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Approve Investor
            </button>
            <button
              onClick={() => onReject(investorId)}
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Reject Investor
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminInvestors() {
  const { user } = useCurrentUser();

  const [investors, setInvestors] = useState<InvestorFullProfileDto[]>([]);
  const [activeTab, setActiveTab] = useState<InvestorProfileStatusEnum>('PENDING_VERIFICATION');
  const [selectedInvestorId, setSelectedInvestorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch investors
    fetchInvestors();
  }, [user]);

  async function fetchInvestors() {
    try {
      setLoading(true);
      const response = await apiGetAdminInvestors();
      setInvestors(response.investors);
    } catch (err) {
      setError('Failed to load investors');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApproveInvestor(id: string) {
    try {
      const response = await apiPostAdminInvestorsByIdApprove({
        pathParams: { id },
      });

      // Update local state with the returned investor
      setInvestors(
        investors.map((investor) => (investor.user.id === id ? response.investor : investor)),
      );

      setSelectedInvestorId(null);
    } catch (err) {
      console.error('Failed to approve investor:', err);
      alert('Failed to approve investor. Please try again.');
    }
  }

  async function handleRejectInvestor(id: string) {
    try {
      const response = await apiPostAdminInvestorsByIdReject({
        pathParams: { id },
      });

      // Update local state with the returned investor
      setInvestors(
        investors.map((investor) => (investor.user.id === id ? response.investor : investor)),
      );

      setSelectedInvestorId(null);
    } catch (err) {
      console.error('Failed to reject investor:', err);
      alert('Failed to reject investor. Please try again.');
    }
  }

  // Filter investors based on active tab
  const filteredInvestors = investors.filter((investor) => investor.status === activeTab);

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
      <div className="grow container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-6">
          <Link to={'/admin'} className={'text-blue-600 hover:underline'}>
            Admin Dashboard
          </Link>{' '}
          - Investors
        </h1>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'PENDING_VERIFICATION'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('PENDING_VERIFICATION')}
            >
              Pending Review
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'VERIFIED'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('VERIFIED')}
            >
              Approved
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'DECLINED'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('DECLINED')}
            >
              Declined
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'INCOMPLETE'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('INCOMPLETE')}
            >
              Incomplete
            </button>
          </nav>
        </div>

        {/* Content */}
        {loading ? (
          <p>Loading investors...</p>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded border border-red-200">{error}</div>
        ) : filteredInvestors.length === 0 ? (
          <p>No {activeTab.toLowerCase().replace('_', ' ')} investors found.</p>
        ) : (
          <div className="space-y-4">
            {filteredInvestors.map((investor) => (
              <InvestorProfileCard
                key={investor.user.id}
                investor={investor}
                onViewDetails={(id) => setSelectedInvestorId(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal for viewing investor details */}
      {selectedInvestorId && (
        <InvestorDetailsModal
          investorId={selectedInvestorId}
          onClose={() => setSelectedInvestorId(null)}
          onApprove={handleApproveInvestor}
          onReject={handleRejectInvestor}
          canApproveReject={activeTab === 'PENDING_VERIFICATION'}
        />
      )}

      <Footer />
    </div>
  );
}
