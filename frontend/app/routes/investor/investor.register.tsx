import type { Route } from './+types/investor.register';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { serverFetch } from '~/utils/serverFetch';
import type { CountriesResponse } from '~/api/apiSchemas';
import { useLoaderData } from 'react-router';
import { RegistrationFormContainer } from '~/components/InvestorRegistration';

export function meta() {
  return [
    { title: 'Register - Mandates.io' },
    {
      name: 'description',
      content: 'Register as an investor to submit and track investment mandates.',
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  // Get step from URL query parameters to validate it
  const url = new URL(request.url);
  const stepParam = url.searchParams.get('step');
  let step = 1;

  if (stepParam) {
    const parsedStep = parseInt(stepParam, 10);
    // Ensure step is within valid range (1-5)
    step = !isNaN(parsedStep) && parsedStep >= 1 && parsedStep <= 5 ? parsedStep : 1;

    // If the parsed step is different from the requested step, we should redirect
    if (step.toString() !== stepParam) {
      url.searchParams.set('step', step.toString());
      // We would typically return redirect(url.toString()) here, but will leave URL as-is
      // and let client-side handling take care of it
    }
  }

  const { data, error } = await serverFetch<CountriesResponse>('/api/v1/countries', request);

  if (error) {
    return {
      countries: [],
      error: error,
      step,
    };
  }

  return {
    ...data,
    step,
  };
}

// Update the type to include the step property we added
type LoaderData = CountriesResponse & { step?: number };

export default function InvestorRegister() {
  const response = useLoaderData<LoaderData>();

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      <Navbar />
      <main className="flex-grow py-10">
        <RegistrationFormContainer countries={response.countries || []} />
      </main>
      <Footer />
    </div>
  );
}
