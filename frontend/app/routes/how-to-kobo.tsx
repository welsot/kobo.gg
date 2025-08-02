import { Navbar } from '~/components/Navbar';
import { Footer } from '~/components/Footer';
import type {Route} from "../../.react-router/types/app/routes/+types/home";


export function meta({}: Route.MetaArgs) {
  const baseUrl = "https://kobo.gg";
  const year = new Date().getFullYear();

  let ymd = `2025-08-01`;

  if (year > 2025) {
    ymd = `${year}-01-01`;
  }
  
  const url = `${baseUrl}/how-to-send-epub-books-to-kobo`;
  
  return [
    { title: "How to Transfer eBooks to Your Kobo eReader - Complete Guide " + year },
    { name: "description", content: "Learn how to easily transfer multiple ePUB and PDF books to your Kobo eReader in 6 simple steps. No account required, completely anonymous uploads." },
    { name: "viewport", content: "width=device-width,initial-scale=1" },
    { name: "keywords", content: "kobo ebook transfer, epub to kobo, kobo ereader books, transfer books kobo, kobo sideload, epub upload" },

    // Open Graph / Facebook
    { property: "og:type", content: "article" },
    { property: "og:url", content: url },
    { property: "og:title", content: "How to Transfer eBooks to Your Kobo eReader - Step by Step Guide" },
    { property: "og:description", content: "Simple 6-step guide to transfer multiple ePUB and PDF books to your Kobo eReader. Anonymous uploads, no registration needed." },
    { property: "og:image", content: `${baseUrl}/kobogg-screenshot.png` },

    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:url", content: url },
    { name: "twitter:title", content: "How to Transfer eBooks to Your Kobo eReader - Complete Guide" },
    { name: "twitter:description", content: "Learn how to easily transfer multiple ePUB and PDF books to your Kobo eReader in 6 simple steps." },
    { name: "twitter:image", content: `${baseUrl}/kobogg-screenshot.png` },

    // Icons
    { rel: "icon", href: "/img/icon.64.png", type: "image/png" },
    { rel: "apple-touch-icon", href: "/img/icon.256.png" },
    { rel: "manifest", href: "/manifest.json" },

    // Color theme
    { name: "theme-color", content: "#59168b" },
    
    // Article metadata
    { name: "article:author", content: "Kobo.gg" },
    { name: "article:published_time", content: ymd },
    { name: "robots", content: "index, follow" }
  ];
}

export default function HowToKobo() {
  const year = new Date().getFullYear();
  
  let ymd = `2025-08-01`;
  let my = `August ${year}`;
  
  if (year > 2025) {
    ymd = `${year}-01-01`;
    my = `January ${year}`;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      <Navbar />
      <main className="flex-grow py-10">
        <article className="max-w-4xl mx-auto px-4 py-8">
          {/* Header Section */}
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              How to Transfer Multiple eBooks to Your Kobo eReader
            </h1>
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              The simplest way to upload and transfer ePUB and PDF books to your Kobo device in just 6 easy steps. 
              No account registration required, completely anonymous.
            </p>
            <div className="flex items-center text-sm text-gray-500 mb-8">
              <time dateTime={ymd}>Updated {my}</time>
              <span className="mx-2">•</span>
              <span>3 minute read</span>
            </div>
          </header>

          {/* Introduction */}
          <section className="mb-10">
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              If you're looking for a quick and secure way to transfer multiple eBooks to your Kobo eReader, 
              you've come to the right place. Whether you have ePUB files, PDFs, or other eBook formats, 
              this guide will show you how to get them onto your device without the hassle of cables or complicated software.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Quick Summary:</strong> Upload your books to kobo.gg, get a short code, 
                    then download directly to your eReader using the built-in web browser.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Video Tutorial Section */}
          <section className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Video Tutorial</h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              Prefer to watch? Check out our step-by-step video tutorial that walks you through the entire process:
            </p>
            
            <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
              <iframe 
                className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                src="https://www.youtube.com/embed/kulOB53-5jY?si=40dVIp8UZB98OzBx" 
                title="How to Transfer eBooks to Your Kobo eReader - Video Tutorial"
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
              />
            </div>
            
            <div className="mt-4 text-center">
              <a 
                href="https://www.youtube.com/watch?v=kulOB53-5jY" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium"
              >
                Watch on YouTube
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </section>

          {/* Step-by-step Guide */}
          <section className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Step-by-Step Transfer Process</h2>
            
            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Visit kobo.gg</h3>
                  <p className="text-gray-700 mb-3">
                    Open your web browser and navigate to <a href="https://kobo.gg" className="text-purple-600 hover:text-purple-800 font-medium">kobo.gg</a>. 
                    The clean, simple interface makes it easy to get started immediately.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Your eBook Files</h3>
                  <p className="text-gray-700 mb-3">
                    Click the upload area or drag and drop your <strong>.epub</strong> and <strong>.pdf</strong> files. 
                    You can upload multiple books at once, making it perfect for transferring your entire library.
                  </p>
                  <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600">
                    <strong>Supported formats:</strong> ePUB, PDF
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Your Short Code</h3>
                  <p className="text-gray-700 mb-3">
                    After uploading, you'll receive a unique short code and a URL in the format <code className="bg-gray-100 px-2 py-1 rounded">kobo.gg/{`{shortCode}`}</code>. 
                    This code is your key to accessing your books on your eReader.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Open kobo.gg on Your eReader</h3>
                  <p className="text-gray-700 mb-3">
                    On your Kobo eReader, go to "More" {'=>'} "Beta Features" {'=>'} "Web Browser" and open the built-in web browser, navigate to <strong>kobo.gg</strong>.
                    The mobile-optimized interface works perfectly on eReader screens.
                  </p>
                  <div className="bg-yellow-50 p-3 rounded-md text-sm text-yellow-800">
                    <strong>Tip:</strong> Make sure your eReader is connected to WiFi before proceeding.
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  5
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Enter Your Short Code</h3>
                  <p className="text-gray-700 mb-3">
                    Type the short code you received in step 3 into the input field and press <strong>"Open"</strong>. 
                    This will take you to your personal book collection.
                  </p>
                </div>
              </div>

              {/* Step 6 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  6
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Download Your Books</h3>
                  <p className="text-gray-700 mb-3">
                    You'll see all your uploaded books listed. Simply tap on each book to download it directly to your eReader. 
                    The books will be saved to your device and available in your library immediately.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Choose This Method?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-2">🔒 Anonymous & Secure</h3>
                <p className="text-green-700 text-sm">
                  No account registration required. Your books are uploaded anonymously and automatically deleted after a period of time.
                </p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">⚡ Fast & Simple</h3>
                <p className="text-blue-700 text-sm">
                  Transfer multiple books in minutes without cables, software installations, or complicated setup procedures.
                </p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">📱 Works on Any Device</h3>
                <p className="text-purple-700 text-sm">
                  Compatible with Kobo, Kindle, and other eReaders with web browser capabilities.
                </p>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-orange-800 mb-2">🔢 Multiple Books</h3>
                <p className="text-orange-700 text-sm">
                  Upload and transfer multiple eBooks at once, perfect for building your digital library quickly.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What file formats are supported?</h3>
                <p className="text-gray-700">
                  Currently, we support ePUB and PDF files. These are the most common eBook formats and work well on most eReaders.
                </p>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How long do my books stay available?</h3>
                <p className="text-gray-700">
                  Your books are available for download for a limited time to ensure privacy and security. 
                  Make sure to download them to your device promptly.
                </p>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Do I need to create an account?</h3>
                <p className="text-gray-700">
                  No account registration is required. The service is completely anonymous and designed for quick, hassle-free transfers.
                </p>
              </div>
              
              <div className="pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What if my eReader doesn't have a web browser?</h3>
                <p className="text-gray-700">
                  Most modern eReaders include a basic web browser. If yours doesn't, you can download the books on another device 
                  and transfer them via USB cable or cloud storage.
                </p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Transfer Your eBooks?</h2>
            <p className="text-lg mb-6 text-purple-100">
              Start transferring your eBook collection to your Kobo eReader in just a few clicks.
            </p>
            <a 
              href="/" 
              className="inline-block bg-white text-purple-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Get Started Now
            </a>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
