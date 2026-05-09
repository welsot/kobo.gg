import { serverFetch } from '~/utils/serverFetch';
import type { BundleBooksResponse } from '~/api/apiSchemas';
import type { Route } from '~/+types/bundle';

export async function loader({ request, params }: Route.LoaderArgs) {
  const shortUrlCode = params.shortUrlCode;

  const title = `<h1><a href="/">Kobo.gg</a> Books</h1>`;

  if (!shortUrlCode) {
    return new Response(`<html lang="en"><body>${title}<h1>Error: Missing shortUrlCode</h1></body></html>`, {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  const { data, error } = await serverFetch<BundleBooksResponse>(
    `/api/kobo/bundles/${shortUrlCode.trim().toLowerCase()}/books`,
    request,
  );

  if (error || !data) {
    return new Response(`<html lang="en"><body>${title}<h1>Error</h1><p>Likely this url expired.</p><p>${error}</p></body></html>`, {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  const books = data.books;
  const expiresAt = new Date(data.expiresAt);
  const expiresAtStr = expiresAt.toLocaleString();
  const expiresAtEl = `<div>Expires: <time datetime="${expiresAtStr}">${expiresAtStr}</time></div>`;

  const html = `<html lang="en">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial, sans-serif; font-size: 18px; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { font-size: 28px; margin-bottom: 25px; }
    a { text-decoration: none; color: #0066cc; }
    ul { list-style: none; padding: 0; }
    li { padding: 15px 0; }
    .book-title { font-size: 22px; margin-bottom: 10px; font-weight: bold; }
    .book-size { font-size: 18px; margin-bottom: 15px; }
    .download-links a { 
      display: inline-block; 
      background: #0066cc; 
      color: white; 
      padding: 12px 20px; 
      margin: 10px 20px 10px 0; 
      border-radius: 6px;
      font-size: 20px;
    }
    hr { margin: 20px 0; border: 1px solid #eee; }
    .expires { font-size: 18px; margin-top: 20px; }
  </style>
</head>
<body>
  ${title}
  ${books.length === 0 ? '<p>No books available</p>' : `
  <ul>
    ${books.map(book => `
      <li>
        <div class="book-title">${book.originalFileName}</div>
        <div class="book-size">Size: ${Math.round(book.fileSize / 1024)} KB</div>
        <div class="download-links">
          <a href="${book.downloadUrl}">Download</a>
          ${book.kepubDownloadUrl ? `<a href="${book.kepubDownloadUrl}">Download KEPUB</a>` : ''}
        </div>
        <hr />
      </li>
    `).join('')}
  </ul>`}
  <div class="expires">${expiresAtEl}</div>
</body>
</html>
`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
