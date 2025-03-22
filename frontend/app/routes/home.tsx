import type { Route } from './+types/home';
import { Hero } from '~/components/Hero';
import { Footer } from '~/components/Footer';

export function meta({}: Route.MetaArgs) {
  const baseUrl = "https://kobo.gg";
  return [
    { title: "Kobo.gg - Easily Upload & Download eBooks for Your Kobo eReader" },
    { name: "description", content: "Upload ePUB books anonymously and quickly download them to your Kobo eReader with short, easy-to-use URLs." },
    { name: "viewport", content: "width=device-width,initial-scale=1" },

    // Open Graph / Facebook
    { property: "og:type", content: "website" },
    { property: "og:url", content: baseUrl },
    { property: "og:title", content: "Kobo.gg - eBook Manager for Kobo Devices" },
    { property: "og:description", content: "The simplest way to upload and transfer ePUB books to your Kobo eReader. Anonymous uploads, no account required." },
    { property: "og:image", content: `${baseUrl}/kobogg-screenshot.png` },

    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:url", content: baseUrl },
    { name: "twitter:title", content: "Kobo.gg - eBook Manager for Kobo Devices" },
    { name: "twitter:description", content: "The simplest way to upload and transfer ePUB books to your Kobo eReader. Anonymous uploads, no account required." },
    { name: "twitter:image", content: `${baseUrl}/kobogg-screenshot.png` },

    // Icons
    { rel: "icon", href: "/img/icon.64.png", type: "image/png" },
    { rel: "apple-touch-icon", href: "/img/icon.256.png" },
    { rel: "manifest", href: "/manifest.json" },

    // Color theme
    { name: "theme-color", content: "#59168b" }
  ];
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
