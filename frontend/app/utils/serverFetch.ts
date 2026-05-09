const BASE_API_URL = import.meta.env.VITE_PRIVATE_API_URL;

type RequestHeaders = {
  [key: string]: string;
};

export async function serverFetch<T>(
  apiUrl: string,
  request: Request,
): Promise<{ data: T | null; error: unknown; status: number }> {
  const finalApiUrl = BASE_API_URL + apiUrl;
  const requestCookies = request.headers.get('Cookie');

  const apiToken = requestCookies
    ?.split(';')
    .find((c: string) => c.trim().startsWith('apiToken='))
    ?.split('=')[1];

  const headers: RequestHeaders = {
    'Content-Type': 'application/json',
  };

  if (apiToken) {
    headers['X-API-TOKEN'] = apiToken;
  }

  try {
    const res = await fetch(finalApiUrl, {
      headers: headers,
    });

    const data = await res.json();

    return {
      data,
      error: null,
      status: res.status,
    };
  } catch (e: unknown) {
    console.error('fetching data error: ', { finalApiUrl, headers, e });
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return {
      data: null,
      error: errorMessage,
      status: 500,
    };
  }
}
