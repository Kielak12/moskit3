
async function ensureSchema(env) {
  await env.DB.exec(`CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S','now'))
  );`);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}

function isAuthed(request) {
  const cookie = request.headers.get('Cookie') || '';
  return /(?:^|;\s*)admin_auth=1(?=;|$)/.test(cookie);
}

export async function onRequest({ request, env, params }) {
  await ensureSchema(env);
  const id = parseInt(params.id, 10);
  if (!id) return json({ message: 'Invalid id' }, 400);

  if (request.method === 'DELETE') {
    if (!isAuthed(request)) return json({ message: 'Unauthorized' }, 401);
    await env.DB.prepare('DELETE FROM reviews WHERE id = ?').bind(id).run();
    return json({ ok: true });
  }

  if (request.method === 'GET') {
    const row = (await env.DB.prepare('SELECT id, name, rating, comment, created_at FROM reviews WHERE id = ?').bind(id).first()) || null;
    if (!row) return json({ message: 'Not found' }, 404);
    return json(row);
  }

  return json({ message: 'Method Not Allowed' }, 405);
}
