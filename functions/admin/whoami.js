
export async function onRequestGet({ request }) {
  const cookie = request.headers.get('Cookie') || '';
  const authed = /(?:^|;\s*)admin_auth=1(?=;|$)/.test(cookie);
  if (!authed) return new Response('Unauthorized', { status: 401 });
  return new Response('OK');
}
