import { Link, useParams } from 'react-router';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { apiPostVerifyEmail } from '~/api/apiComponents';
import { ContentLoadingIndicator, StaticLayout } from '~/components/StaticLayout';
import { Txt } from '~/cms/Txt';

export default function ConfirmEmailPage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) return;

    const reqBody = { token: token };

    apiPostVerifyEmail({ body: reqBody })
      .then(() => setSuccess(true))
      .catch(() => setSuccess(false))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <StaticLayout>
        <ContentLoadingIndicator />
      </StaticLayout>
    );
  }

  return (
    <StaticLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center p-6"
      >
        <div className="bg-white shadow-xl rounded-lg p-8 max-w-md w-full text-center">
          {success ? (
            <>
              <CheckCircleIcon className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                <Txt k={'confirmEmail.success.title'}>Email Verified Successfully</Txt>
              </h1>
            </>
          ) : (
            <>
              <ExclamationCircleIcon className="w-16 h-16 mx-auto text-red-500 mb-4" />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                <Txt k={'confirmEmail.error.title'}>Error</Txt>
              </h1>
              <p className="text-gray-600 mb-6">
                <Txt k={'confirmEmail.error.message'}>
                  We encountered an error while trying to verify your email. Please try again later
                  or contact support.
                </Txt>
              </p>
            </>
          )}
          <Link
            to="/"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
          >
            <Txt k={'confirmEmail.returnButton'}>Return to Homepage</Txt>
          </Link>
        </div>
      </motion.div>
    </StaticLayout>
  );
}
