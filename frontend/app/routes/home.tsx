import type { Route } from './+types/home';
import { Hero } from '../components/Hero';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Kobo.gg' },
    {
      name: 'description',
      content:
        '',
    },
  ];
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <Hero />
      </main>
      <footer className="text-center py-6 text-sm text-gray-600">
        <div className="flex flex-col items-center gap-1">
          <p>
            &copy; {new Date().getFullYear()} kobo.gg &mdash; Developed by{' '}
            <a
              href="https://welsot.com"
              className="font-medium text-purple-600 hover:text-purple-800 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Welsot Solutions
            </a>
          </p>
          <p className="text-xs text-gray-500">All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
