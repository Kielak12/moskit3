
// functions/_middleware.js
export async function onRequest({ request, next }) {
  try {
    const url = new URL(request.url);
    const path = url.pathname;

    const isAdmin = path.startsWith('/admin');
    const isPublicAdminEndpoint =
      path === '/admin/login' ||
      path === '/admin/login.html' ||
      path === '/admin/whoami' ||
      path === '/admin/logout';

    if (isAdmin && !isPublicAdminEndpoint) {
      const cookie = request.headers.get('Cookie') || '';
      const authed = /(?:^|;\s*)admin_auth=1(?=;|$)/.test(cookie);

      if (!authed) {
        const wantsHTML = (request.headers.get('Accept') || '').includes('text/html');
        if (wantsHTML) {
          // ⚠️ Używamy adresu ABSOLUTNEGO – względny bywa powodem 1101
          const loginUrl = new URL('/admin/login.html', url);
          return Response.redirect(loginUrl, 302);
        }
        return new Response(JSON.stringify({ message: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return await next();
  } catch (err) {
    // czytelny komunikat w logach zamiast 1101 bez treści
    return new Response('Middleware error: ' + (err?.message || String(err)), { status: 500 });
  }
}
