# todo-api

Repository backend REST API menggunakan Bun dan TypeScript.
Frontend berada di repository terpisah: `todo-frontend`.

## Jalankan

Pasang Bun 1.2+ dari https://bun.sh, lalu di folder repository ini:

```sh
bun install
bun run dev
```

API: http://localhost:3000. Pemeriksaan tipe: `bun run check`.
`bun run start` menjalankan server tanpa watch.

## Endpoint

| Metode | Endpoint | Fungsi |
|---|---|---|
| GET | /api/todos | Daftar tugas |
| GET | /api/todos/:id | Detail tugas |
| POST | /api/todos | Tambah tugas |
| PATCH | /api/todos/:id | Ubah judul/status |
| DELETE | /api/todos/:id | Hapus tugas |

POST: `{"title":"Belajar Bun"}`.
PATCH: `{"completed":true}` atau `{"title":"Judul baru"}`.
Gunakan header `Content-Type: application/json` untuk POST/PATCH.
POST menghasilkan 201; DELETE 204; GET/PATCH 200.
Error JSON memiliki properti `message`, dengan status 400, 404, 405, atau 415.

Kode utama: `src/index.ts`. Data disimpan dalam Map, sehingga hilang saat
server restart. Proyek pembelajaran lokal, tanpa autentikasi/database.
Server terikat ke 127.0.0.1:3000. Frontend memakai proxy Vite sehingga tidak
memerlukan CORS untuk menjalankan kedua repository di komputer yang sama.
