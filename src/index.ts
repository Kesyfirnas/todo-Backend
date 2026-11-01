// Penyimpanan di memori: data kembali kosong ketika server restart.
type Todo = { id: string; title: string; completed: boolean };
const todos = new Map<string, Todo>();
const json = (data: unknown, status = 200) => Response.json(data, { status });
const fail = (message: string, status: number) => json({ message }, status);
const validTitle = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 120;

Bun.serve({
  hostname: '127.0.0.1',
  port: 3000,
  async fetch(req) {
    const path = new URL(req.url).pathname;
    const match = path.match(/^\/api\/todos\/([^/]+)$/);
    const collection = path === '/api/todos';
    if (!collection && !match) return fail('Endpoint tidak ditemukan', 404);
    const allowed = collection ? ['GET', 'POST'] : ['GET', 'PATCH', 'DELETE'];
    if (!allowed.includes(req.method)) {
      return new Response(JSON.stringify({ message: 'Metode tidak diizinkan' }), {
        status: 405, headers: { 'Content-Type': 'application/json', Allow: allowed.join(', ') }
      });
    }
    const id = match?.[1];
    const todo = id ? todos.get(id) : undefined;
    if (id && !todo) return fail('Tugas tidak ditemukan', 404);
    if (req.method === 'GET') return json(id ? todo : [...todos.values()]);
    if (req.method === 'DELETE') {
      todos.delete(id!);
      return new Response(null, { status: 204 });
    }
    if (!req.headers.get('content-type')?.includes('application/json')) {
      return fail('Gunakan Content-Type: application/json', 415);
    }
    let body: Record<string, unknown>;
    try {
      const value = await req.json();
      if (!value || typeof value !== 'object' || Array.isArray(value)) return fail('Body harus objek JSON', 400);
      body = value;
    } catch { return fail('JSON tidak valid', 400); }
    if (req.method === 'POST') {
      if (!validTitle(body.title)) return fail('Judul wajib diisi, maksimal 120 karakter', 400);
      const created: Todo = { id: crypto.randomUUID(), title: body.title.trim(), completed: false };
      todos.set(created.id, created);
      return json(created, 201);
    }
    if (!('title' in body) && !('completed' in body)) return fail('Isi title atau completed', 400);
    if ('title' in body && !validTitle(body.title)) return fail('Judul wajib diisi, maksimal 120 karakter', 400);
    if ('completed' in body && typeof body.completed !== 'boolean') return fail('completed harus boolean', 400);
    if (typeof body.title === 'string') todo!.title = body.title.trim();
    if (typeof body.completed === 'boolean') todo!.completed = body.completed;
    return json(todo);
  }
});
console.log('REST API berjalan di http://localhost:3000');
