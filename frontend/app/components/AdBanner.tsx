import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

const AD_URL = 'https://pintoteca.com?ref=kobo';

/** Lucide "blocks" icon (https://lucide.dev/icons/blocks), inlined to avoid a dependency for a single glyph. */
function BlocksIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M10 22V7a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a1 1 0 0 0-1-1H2" />
      <rect x="14" y="2" width="8" height="8" rx="1" />
    </svg>
  );
}

export function AdBanner() {
  return (
    <aside className="w-full max-w-2xl mx-auto mt-12" aria-label="Sponsored">
      <a
        href={AD_URL}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="group relative block overflow-hidden rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 via-white to-green-50 px-6 py-7 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
      >
        {/* Decorative accents */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-10 -right-8 h-32 w-32 rounded-full bg-green-200/40 blur-2xl transition-transform duration-300 group-hover:scale-125"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-purple-200/30 blur-2xl"
        />

        <span className="absolute top-3 right-3 rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-purple-400">
          Ad
        </span>

        <div className="relative flex items-start gap-4">
          <span className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
            <BlocksIcon className="h-6 w-6" />
          </span>

          <div className="min-w-0 flex-grow">
            <h3 className="text-xl md:text-2xl font-bold text-purple-900">
              Free Printable Worksheets for Kids
            </h3>
            <p className="mt-1 text-sm md:text-base text-gray-600">
              Math <span className="text-purple-300">·</span> Reading{' '}
              <span className="text-purple-300">·</span> Writing{' '}
              <span className="text-purple-300">·</span> Activities
            </p>
            <p className="mt-1 text-sm font-medium text-green-700">
              Learn. Practice. Create.
            </p>
            <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600 transition-colors group-hover:text-purple-800">
              PatioDeJuegos.es
              <ArrowTopRightOnSquareIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </p>
          </div>
        </div>
      </a>
    </aside>
  );
}
