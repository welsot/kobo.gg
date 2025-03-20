import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
} from 'react-router';

import type { Route } from './+types/root';
import './app.css';
import { serverFetch } from '~/utils/serverFetch';
import type { GetInitResponse } from '~/api/apiSchemas';
import { UserProvider } from './context/UserContext';
import { useEffect } from 'react';
import { TxtProvider } from '~/context/TxtContext';
import { AnimatePresence, motion } from 'framer-motion';
import { EnsureUserSet } from '~/components/AuthRequired';

export async function loader({ request }: Route.LoaderArgs) {
  const { data, error } = await serverFetch<GetInitResponse>('/api/v1/init', request);

  if (error || !data) {
    return { user: null, txt: {}, error: error };
  }

  return data;
}

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const data = useLoaderData<GetInitResponse>();
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';

  useEffect(() => {
    console.log('Current user:', data.user);
  }, []);

  return (
    <UserProvider initialUser={data.user}>
      <EnsureUserSet />
      <TxtProvider txt={data.txt}>
        <div className="relative">
          <AnimatePresence>
            {isLoading && (
              <>
                <motion.div
                  className="fixed top-0 left-0 right-0 h-1 bg-blue-600 z-50"
                  initial={{ scaleX: 0, transformOrigin: 'left' }}
                  animate={{ scaleX: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                />
                <motion.div
                  className="fixed top-0 left-0 w-full h-full bg-black/5 backdrop-blur-[1px] z-40 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </>
            )}
          </AnimatePresence>
          <Outlet />
        </div>
      </TxtProvider>
    </UserProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404 ? 'The requested page could not be found.' : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
