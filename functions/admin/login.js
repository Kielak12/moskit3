
export async function onRequestPost({ request }) {
  try {
    const { login, password } = await request.json();
    if (login === '123' && password === '123') {
      const headers = new Headers({ 'Content-Type': 'application/json' });
      // Secure cookie for production environments (HTTPS). For local, it's okay too.
      headers.append('Set-Cookie', 'admin_auth=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400');
      return new Response(JSON.stringify({ ok: true }), { headers });
    }
    return new Response(JSON.stringify({ message: 'Nieprawidłowy login lub hasło' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ message: 'Błąd danych wejściowych' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestGet() {
  // Show a very simple help for GET
  return new Response('POST JSON {login,password}', { status: 405 });
}
