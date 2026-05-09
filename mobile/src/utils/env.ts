const ENV = import.meta.env.VITE_APP_ENV;

export const isProd = ENV === 'production';
export const isDev = ENV === 'development';

export const apiUrl = import.meta.env.VITE_API_URL;