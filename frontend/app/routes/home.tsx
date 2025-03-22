import type { Route } from './+types/home';
import { Hero } from '~/components/Hero';
import { Footer } from '~/components/Footer';
import { redirect } from 'react-router';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Kobo.gg' },
    {
      name: 'description',
      content: 'Download your ebooks easily',
    },
  ];
}

function koboHtmlTemplate() {
  return `<html lang="en">
    <head>
      <title>Kobo.gg</title>
      <style>
        body { font-family: sans-serif; margin: 20px; text-align: center; }
        h1 { font-size: 36px; margin-bottom: 20px; }
        p { font-size: 24px; margin-bottom: 30px; }
        form { max-width: 400px; margin: 0 auto; }
        input { width: 100%; font-size: 24px; padding: 12px; margin-bottom: 20px; box-sizing: border-box; border: 2px solid #888; border-radius: 4px; }
        button { width: 100%; font-size: 24px; padding: 15px; background-color: #0077cc; color: white; border: none; border-radius: 4px; cursor: pointer; }
      </style>
    </head>
    <body>
      <h1>Kobo.gg</h1>
      <p>Enter your download code:</p>
      <form method="post">
        <input type="text" name="shortCode" placeholder="Enter code here" required>
        <button type="submit">Download Book</button>
      </form>
    </body>
  </html>`;
}

export async function loader({ request }: Route.LoaderArgs) {
  const ua = request.headers.get('User-Agent');
  if (!ua) return {};

  const isEReader = ua.includes('Kobo') || ua.includes('Kindle');
  if (!isEReader) return {};

  const html = koboHtmlTemplate();
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const shortCode = formData.get('shortCode');

  if (typeof shortCode === 'string' && shortCode.trim()) {
    return redirect(`/${shortCode.trim().toLowerCase()}`);
  }

  return redirect('/');
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
