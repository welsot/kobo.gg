import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('/login', 'routes/login.tsx'),
  route('/about', 'routes/about.tsx'),
  route('/contact', 'routes/contact.tsx'),
  route('/terms', 'routes/terms.tsx'),
  route('/privacy', 'routes/privacy.tsx'),
  route('/:shortUrlCode', 'routes/bundle.tsx'),
] satisfies RouteConfig;
