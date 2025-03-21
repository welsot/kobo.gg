import { serverFetch } from '~/utils/serverFetch';
import type { BookDto, BundleBooksResponse } from '~/api/apiSchemas';
import type { Route } from '~/+types/bundle';

export async function loader({ request, params }: Route.LoaderArgs) {
  const shortUrlCode = params.shortUrlCode;
  if (!shortUrlCode) {
    return new Response(`<html lang="en"><body><h1>Error: Missing shortUrlCode</h1></body></html>`, {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  const { data, error } = await serverFetch<BundleBooksResponse>(
    `/api/kobo/bundles/${shortUrlCode}/books`,
    request,
  );

  if (error || !data) {
    return new Response(`<html lang="en"><body><h1>Error</h1><p>Likely this url expired.</p><p>${error}</p></body></html>`, {
      headers: { 'Content-Type': 'text/html' },
    });
  }
  
  const books = data.books
  const expiresAt = new Date(data.expiresAt);

  const html = `<html lang="en"><body>
    <h1>Available Books</h1>
    ${books.length === 0 ? '<p>No books available</p>' : `
    <ul>
      ${books.map(book => `
        <li>
          <div>${book.originalFileName}</div>
          <div>Size: ${Math.round(book.fileSize / 1024)} KB</div>
          <div><a href="${book.downloadUrl}">Download</a></div>
          ${book.kepubDownloadUrl ? `<div><a href="${book.kepubDownloadUrl}">Download KEPUB</a></div>` : ''}
          <hr />
        </li>
      `).join('')}
    </ul>`}
  </body></html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
