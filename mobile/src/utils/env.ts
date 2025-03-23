const ENV = import.meta.env.VITE_APP_ENV;

export const isProd = ENV === 'production';
export const isDev = ENV === 'development';