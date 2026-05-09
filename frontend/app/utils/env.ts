const ENV = import.meta.env.VITE_ENV;

export const isProd = ENV === 'prod';
export const isDev = ENV === 'dev';