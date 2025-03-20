import { api } from './api';

export const authService = {
  setApiToken: (token: string | null) => {
    if (token) {
      api.setAuthToken(token);
      //storageService.setApiToken(token);
      //saveApiTokenToCookies(token);
    } else {
      api.setAuthToken(null);
      //storageService.deleteApiToken();
    }
  },
};

