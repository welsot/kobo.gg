import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { FormInput, FormLabel, Req } from '~/components/form';
import { authService } from '~/utils/authService';
import { useCurrentUser } from '~/context/UserContext';
import { Footer } from '~/components/Footer';
import { Navbar } from '~/components/Navbar';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { apiUsersLogin, apiUsersRegister } from '~/api/apiComponents';


type LoginSteps = 'email' | 'verification';

const errMsg = (
  <>
    Failed to send verification code. Please check your email and try again.
  </>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<LoginSteps>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, setUser } = useCurrentUser();

  if (user) {
    return <AlreadyAuthenticated />;
  }

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiUsersRegister({ body: { email: email.trim() } });
      setStep('verification');
    } catch (err) {
      // @ts-ignore
      if (err?.code === 'valid_otp_already_exists') {
        // If a valid OTP already exists, proceed to verification step
        setStep('verification');
      } else {
        // @ts-ignore
        setError(errMsg + ' Code: ' + err?.code);
        console.error('OTP request error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Verify OTP and log in
      const loginRequest = { email: email.trim(), code: otp.trim() };
      const response = await apiUsersLogin({ body: loginRequest });

      // Set token and update user context
      authService.setApiToken(response.token);
      setUser(response.user);

      // Redirect to home page after successful login
      navigate('/');
    } catch (err) {
      setError('Invalid verification code. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col items-center justify-center text-center">
          <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-blue-100">
            <div className="text-blue-600 mb-6">
              <LockClosedIcon className="h-16 w-16 mx-auto" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Sign in to your account
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-8">
                Access exclusive investment opportunities and manage your mandates
            </p>

            {error && (
              <div className="rounded-md bg-red-50 p-4 mb-6">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 'email' ? (
              <form className="space-y-6 max-w-md mx-auto" onSubmit={handleEmailSubmit}>
                <div>
                  <FormLabel htmlFor="email">
                    Email Address <Req />
                  </FormLabel>
                  <FormInput
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full text-lg px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Continue'}
                  </button>
                </div>

                <p className="text-center text-gray-600 mt-4">
                  Don't have an account?{' '}
                  <Link
                    to="/investor/register"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Register Now
                  </Link>
                </p>
              </form>
            ) : (
              <form className="space-y-6 max-w-md mx-auto" onSubmit={handleVerificationSubmit}>
                <div>
                  <p className="text-gray-600 mb-4">
                      We've sent a verification code to <strong>{email}</strong>. Please enter it
                      below to continue.
                  </p>

                  <FormLabel htmlFor="otp">
                    Verification Code <Req />
                  </FormLabel>
                  <FormInput
                    id="otp"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter verification code"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Use a different email
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleEmailSubmit({
                        preventDefault: () => {},
                      } as any)
                    }
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Resend code
                  </button>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full text-lg px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function AlreadyAuthenticated() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col items-center justify-center text-center">
          <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-blue-100">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              You are already signed in
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
                You can access all features and opportunities
            </p>
            <Link
              to="/"
              className="text-lg px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors duration-200 shadow-md hover:shadow-lg inline-block"
            >
              Go to Home Page
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
