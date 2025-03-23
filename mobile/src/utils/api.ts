import { storageService } from './storage';

const BASE_API_URL = import.meta.env.VITE_API_URL;

export class HttpClient {
  private static instance?: HttpClient;

  constructor(private authToken: string | null) {
    HttpClient.instance = this;
  }

  static getInstance(): HttpClient {
    const apiToken = storageService.getApiToken();
    return HttpClient.instance || new HttpClient(apiToken);
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  fetch(
    url: string,
    init?: {
      headers: Record<string, string>;
      method: string;
      body: (any & FormData) | string | undefined;
      signal: AbortSignal | undefined;
    },
  ) {
    const headers = this.headers();

    init?.headers && Object.assign(headers, init.headers);

    const finalInit = {
      ...init,
      headers,
    };

    const finalUrl = `${BASE_API_URL}${url}`;
    const res = fetch(finalUrl, { ...finalInit, credentials: 'include' });

    return res;
  }

  private headers() {
    type HeadersType = {
      [key: string]: string;
    };
    const headers: HeadersType = {
      'X-Tunnel-Skip-AntiPhishing-Page': 'true',
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (this.authToken) {
      headers['X-API-TOKEN'] = this.authToken;
    } else {
      const savedApiToken = storageService.getApiToken();
      if (savedApiToken) {
        headers['X-API-TOKEN'] = savedApiToken;
        this.setAuthToken(savedApiToken);
      }
    }

    return headers;
  }
}

export const api = HttpClient.getInstance();
