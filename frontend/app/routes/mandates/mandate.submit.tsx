import { MandateFormContainer } from '~/components/MandateSubmission/MandateFormContainer';
import { useEffect } from 'react';
import { useMandateSubmissionStore } from '~/store/mandateSubmissionStore';
import { useCurrentUser } from '~/context/UserContext';
import { Link, useNavigate } from 'react-router';
import { AuthRequired } from '~/components/AuthRequired';
import { Navbar } from '~/components/Navbar';
import { Footer } from '~/components/Footer';
import type { Route } from '../../../.react-router/types/app/routes/mandates/+types/mandate.submit';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Submit an Investment Mandate' },
    {
      name: 'description',
      content:
        'Submit your investment mandate to Mandates.io and connect with qualified investors looking for deals that match your criteria.',
    },
  ];
}

export default function SubmitMandatePage() {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const { form, setForm } = useMandateSubmissionStore();

  // If user is authenticated, pre-fill the email in the contact info
  useEffect(() => {
    if (user && user.email && !form.contactInfo.email) {
      setForm({
        contactInfo: {
          ...form.contactInfo,
          email: user.email,
        },
      });
    }
  }, [user, form.contactInfo.email, setForm]);

  if (!user) {
    return <AuthRequired />;
  }

  const hasInvestorAccount = user.investorProfile !== null;

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      <Navbar />
      <main className="flex-grow py-10">
        {hasInvestorAccount ? <MandateFormContainer user={user} /> : <InvestorAccountRequired />}
      </main>
      <Footer />
    </div>
  );
}

/**
 * Show a message that account is required to submit a mandate and a button to go to /investor/register or /login page if they already have an account
 */
function InvestorAccountRequired() {
  return (
    <div className="container mx-auto px-4">
      <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100 text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Investor Account Required</h2>
        <p className="text-gray-600 mb-8">
          You need to have an investor account to submit a mandate. If you already have an account,
          please login.
        </p>
        <div className="flex justify-center">
          <Link
            to="/investor/register"
            prefetch={'intent'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Create Investor Account
          </Link>
          <Link
            to="/login"
            prefetch={'intent'}
            className="ml-4 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
