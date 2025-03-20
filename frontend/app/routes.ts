import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('/login', 'routes/login.tsx'),
  route('/about', 'routes/about.tsx'),
  route('/contact', 'routes/contact.tsx'),
  route('/terms', 'routes/terms.tsx'),
  route('/privacy', 'routes/privacy.tsx'),
  // investor:
  route('/dashboard', 'routes/dashboard.tsx'),
  route('/investor/register', 'routes/investor/investor.register.tsx'),
  route('/investor/register/success', 'routes/investor/investor.register.success.tsx'),
  route('/confirm-email/:token', 'routes/confirm-email.tsx'),
  // mandates:
  route('/mandates', 'routes/mandates.tsx'),
  route('/mandates/:uuid', 'routes/mandate.tsx'),
  route('/mandate/submit', 'routes/mandates/mandate.submit.tsx'),
  route('/mandate/success', 'routes/mandates/mandate.success.tsx'),
  // admin
  route('/admin', 'routes/admin/admin.index.tsx'),
  route('/admin/mandates', 'routes/admin/admin.mandates.tsx'),
  route('/admin/investors', 'routes/admin/admin.investors.tsx'),
  route('/admin/deals', 'routes/admin/admin.deals.tsx'),
  route('/admin/txt', 'routes/admin/admin.txt.tsx'),
  // deals:
  route('/mandates/:uuid/submit-deal', 'routes/mandates/mandate.submit-deal.tsx'),
  route('/mandates/:uuid/submit-deal/success', 'routes/mandates/mandate.submit-deal.success.tsx'),
] satisfies RouteConfig;
