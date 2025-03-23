const localStorageStore = {
  get: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  },
  getObject: <T>(key: string): T | null => {
    const storedValue = localStorageStore.get(key);

    if (!storedValue) return null;

    return JSON.parse(storedValue) as T;
  },
  set: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, value);
  },
  setObject: (key: string, value: object) => {
    localStorageStore.set(key, JSON.stringify(value));
  },
  delete: (key: string) => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
  },
};

export const storageService = {
  // api token
  getApiToken: () => localStorageStore.get('apiToken'),
  setApiToken: (token: string) => localStorageStore.set('apiToken', token),
  deleteApiToken: () => localStorageStore.delete('apiToken'),
};
