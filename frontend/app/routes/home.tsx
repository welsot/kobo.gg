import type { Route } from './+types/home';
import { Hero } from '~/components/Hero';
import { Footer } from '~/components/Footer';

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

function koboHtmlTemplate() {
  const title = `<h1>Kobo.gg</h1>`;
  const description = `<p>Download books using short code</p>`;

  const content = `${title}${description}`;

  return `<html lang="en"><body>${content}</body></html>`;
}

export async function loader({ request, params }: Route.LoaderArgs) {
  // we check user agent and if it's an e-reader (kobo/kindle) then we serve a super simple html page
  // on which user can submit a short code and it will redirect him to the download page
  const ua = request.headers.get('User-Agent');

  if (!ua) {
    return {};
  }

  const isKobo = ua.includes('Kobo');
  const isKindle = ua.includes('Kindle');
  
  const isEReader = isKobo || isKindle;
  
  if (!isEReader) {
    return {}
  }

  const html = koboHtmlTemplate();
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <Hero />
      </main>
      <Footer />
    </div>
  );
}
