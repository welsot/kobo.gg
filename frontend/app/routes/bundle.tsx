import { serverFetch } from '~/utils/serverFetch';
import type { BookDto } from '~/api/apiSchemas';
import { Route } from '~/+types/bundle';

export async function loader({ request, params }: Route.LoaderArgs) {
  const shortUrlCode = params.shortUrlCode;
  if (!shortUrlCode) {
    return new Response(`<html lang="en"><body><h1>Error: Missing shortUrlCode</h1></body></html>`, {
      headers: { "Content-Type": "text/html" }
    });
  }

  const { data, error } = await serverFetch<BookDto[]>(
    `/api/kobo/bundles/${shortUrlCode}/books`,
    request,
  );

  if (error || !data) {
    return new Response(`<html lang="en"><body><h1>Error</h1><p>${error}</p></body></html>`, {
      headers: { "Content-Type": "text/html" }
    });
  }

  const html = `<html lang="en"><body>
    <h1>Available Books</h1>
    ${data.length === 0 ? '<p>No books available</p>' : `
    <ul>
      ${data.map(book => `
        <li>
          <div>${book.originalFileName}</div>
          <div>Size: ${Math.round(book.fileSize / 1024)} KB</div>
          <div><a href="${book.downloadUrl}">Download Book</a></div>
          <hr />
        </li>
      `).join('')}
    </ul>`}
  </body></html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html" }
  });
}
