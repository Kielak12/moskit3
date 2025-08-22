
async function ensureSchema(env) {
  await env.DB.exec("\nCREATE TABLE IF NOT EXISTS reviews (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name TEXT NOT NULL,\n  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),\n  comment TEXT NOT NULL,\n  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S','now'))\n);\nCREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);\n");
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}

function isAuthed(request) {
  const cookie = request.headers.get('Cookie') || '';
  return /(?:^|;\s*)admin_auth=1(?=;|$)/.test(cookie);
}

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const method = request.method.toUpperCase();

  await ensureSchema(env);

  if (method === 'GET') {
    const limit = Math.max(1, Math.min(200, parseInt(url.searchParams.get('limit') || '50', 10)));
    const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10));
    const stmt = env.DB.prepare('SELECT id, name, rating, comment, created_at FROM reviews ORDER BY created_at DESC LIMIT ? OFFSET ?').bind(limit, offset);
    const res = await stmt.all();
    return json({ items: res.results || [] });
  }

  if (method === 'POST') {
    if (!isAuthed(request)) return json({ message: 'Unauthorized' }, 401);
    let body;
    try { body = await request.json(); } catch (e) { return json({ message: 'Invalid JSON' }, 400); }
    const name = (body.name || '').toString().trim();
    const rating = parseInt(body.rating, 10);
    const comment = (body.comment || '').toString().trim();
    if (!name || !comment || !rating || rating < 1 || rating > 5) {
      return json({ message: 'Nieprawidłowe dane' }, 400);
    }
    const stmt = env.DB.prepare('INSERT INTO reviews (name, rating, comment) VALUES (?, ?, ?)').bind(name, rating, comment);
    const res = await stmt.run();
    return json({ ok: true, id: res.lastRowId });
  }

  return json({ message: 'Method Not Allowed' }, 405);
}
