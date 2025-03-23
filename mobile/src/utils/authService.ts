import { storageService } from './storage';
import { api } from './api';
import { isDev } from '../utils/env';

export const authService = {
  setApiToken: (token: string | null) => {
    if (token) {
      api.setAuthToken(token);
      if (isDev) {
        storageService.setApiToken(token);
        saveApiTokenToCookies(token);
      }
    } else {
      api.setAuthToken(null);
      storageService.deleteApiToken();
    }
  },
};

export const saveApiTokenToCookies = (token: string) => {
  if (typeof document !== 'undefined') {
    const oneYearInSeconds = 365 * 24 * 60 * 60;
    document.cookie = `apiToken=${token}; path=/; max-age=${oneYearInSeconds}; SameSite=Lax; Secure`;
  }
};
