import { useState } from 'react';

export function ShortCodeInput() {
  const [shortCode, setShortCode] = useState('');

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (shortCode.length >= 4 && shortCode.length <= 8) {
      window.location.href = `/${shortCode.trim().toLowerCase()}`;
    }
  };

  return (
    <div className="mb-8 w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4">
        <b>Download</b> books using a short code:
      </h2>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={shortCode}
          onChange={(e) => setShortCode(e.target.value)}
          placeholder="Enter short code (4-8 chars)"
          className="px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500 flex-grow"
          minLength={4}
          maxLength={8}
        />
        <a
          href={`/${shortCode.trim().toLowerCase()}`}
          className="bg-purple-600 text-white px-4 py-2 rounded-r-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          Go
        </a>
      </form>
    </div>
  );
}
