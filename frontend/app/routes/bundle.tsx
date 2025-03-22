import { serverFetch } from '~/utils/serverFetch';
import type { BundleBooksResponse } from '~/api/apiSchemas';
import type { Route } from '~/+types/bundle';

export async function loader({ request, params }: Route.LoaderArgs) {
  const shortUrlCode = params.shortUrlCode;

  const title = <h1><a href="/">Kobo.gg</a> Books</h1>;

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

  const html = `<html lang="en"><body>
    ${title}
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
    ${expiresAtEl}
  </body></html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
