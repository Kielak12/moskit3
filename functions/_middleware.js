
/**
 * Middleware: chroni /admin/* przed dostępem niezalogowanych.
 * Używa ciasteczka admin_auth=1 ustawianego po poprawnym logowaniu.
 */
export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // allow static assets and login endpoints
  const isAdminPath = path.startsWith('/admin');
  const isLoginPage = path === '/admin/login' || path === '/admin/login.html' || path === '/admin/whoami';
  const isLogout = path === '/admin/logout';

  if (isAdminPath && !isLoginPage && !isLogout) {
    const cookie = request.headers.get('Cookie') || '';
    const authed = /(?:^|;\s*)admin_auth=1(?=;|$)/.test(cookie);
    if (!authed) {
      // If client requested HTML, redirect to login page
      const acceptsHTML = (request.headers.get('Accept') || '').includes('text/html');
      if (acceptsHTML) {
        return Response.redirect('/admin/login.html', 302);
      }
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
  }
  return next();
}
