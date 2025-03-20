import { Link } from 'react-router';
import { Footer } from './Footer';
import { Navbar } from './Navbar';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { Txt } from '~/cms/Txt';
import { useEffect } from 'react';
import { apiGetMe } from '~/api/apiComponents';
import { useCurrentUser } from '~/context/UserContext';
import { storageService } from '~/utils/storage';

export function EnsureUserSet() {
  const { user, setUser } = useCurrentUser();

  useEffect(() => {
    if (typeof window !== 'undefined' && !user && storageService.getApiToken()) {
      apiGetMe()
        .then((res) => {
          setUser(res.user);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [user]);

  return null;
}

export function AuthRequired() {
  const { setUser } = useCurrentUser();

  useEffect(() => {
    apiGetMe()
      .then((res) => {
        setUser(res.user);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <AuthRequiredContent />

      <Footer />
    </div>
  );
}

function AuthRequiredContent() {
  return (
    <main className="flex-grow bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col items-center justify-center text-center">
        <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-blue-100">
          <div className="text-blue-600 mb-6">
            <LockClosedIcon className="h-16 w-16 mx-auto" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-8">
              You need to be logged in to access this page. Join our community of investors and deal
              sponsors to unlock exclusive investment opportunities.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              prefetch={'intent'}
              to="/login"
              className="text-lg px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Log In
            </Link>

            <Link
              prefetch={'intent'}
              to="/investor/register"
              className="text-lg px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Register Now
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
