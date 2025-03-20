import { storageService } from './storage';
import { api } from './api';

export const authService = {
  setApiToken: (token: string | null) => {
    if (token) {
      api.setAuthToken(token);
      storageService.setApiToken(token);
      //saveApiTokenToCookies(token);
    } else {
      api.setAuthToken(null);
      storageService.deleteApiToken();
    }
  },
};

// this way of setting a cookie has a drawback that it's not being sent to the server if site is opened via link
// from different site, only following requests will have this cookie, this causes initial render to be as non-authenticated user
// and then re-render once we refetch the user via js
export const saveApiTokenToCookies = (token: string) => {
  if (typeof document !== 'undefined') {
    const oneYearInSeconds = 365 * 24 * 60 * 60;
    document.cookie = `apiToken=${token}; path=/; max-age=${oneYearInSeconds}; SameSite=Strict; Secure`;
  }
};
