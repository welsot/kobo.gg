import { useLoaderData } from 'react-router';
import type { Route } from '~/+types/bundle';
import type { BookDto } from '~/api/apiSchemas';
import { serverFetch } from '~/utils/serverFetch';

export async function loader({ request, params }: Route.LoaderArgs) {
  const shortUrlCode = params.shortUrlCode;

  if (!shortUrlCode) {
    return { books: [], error: 'Missing shortUrlCode' };
  }

  const { data, error, status } = await serverFetch<BookDto[]>(
    `/api/kobo/bundles/${shortUrlCode}/books`,
    request,
  );

  if (error || !data) {
    return { books: [], error: error as string };
  }

  return { books: data, error: null };
}

export default function BundlePage() {
  const { books, error } = useLoaderData<typeof loader>();

  if (error) {
    return (
      <>
        <h1>Error</h1>
        <p>{error}</p>
      </>
    );
  }

  return (
    <>
      <h1>Available Books</h1>
      {books.length === 0 ? (
        <p>No books available</p>
      ) : (
        <ul>
          {books.map((book: BookDto) => (
            <li key={book.id}>
              <div>{book.originalFileName}</div>
              <div>Size: {Math.round(book.fileSize / 1024)} KB</div>
              <div>
                <a href={book.downloadUrl}>Download Book</a>
              </div>
              <hr />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}