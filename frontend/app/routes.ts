import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('/ereader', 'routes/ereader.tsx'),
  route('/how-to-send-epub-books-to-kobo', 'routes/how-to-kobo.tsx'),
  route('/how-to-send-epub-books-to-kindle', 'routes/how-to-kindle.tsx'),
  route('/:shortUrlCode', 'routes/bundle.tsx'),
] satisfies RouteConfig;
