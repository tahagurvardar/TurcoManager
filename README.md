# TurcoManager

Football manager / teknik direktör simülasyonu.

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB Atlas / MongoDB
- Auth: JWT

## Demo URL

- Frontend demo: `https://YOUR-VERCEL-DEMO.vercel.app`
- Backend API: `https://YOUR-BACKEND-URL`
- Health check: `https://YOUR-BACKEND-URL/api/health`

## Demo Hesapları

Bu hesaplar sadece demo ortamı içindir.

| Rol | Kullanıcı | Şifre |
| --- | --- | --- |
| Admin | `admin` | `123456` |
| Teknik Direktör | `gs` | `123456` |
| Teknik Direktör | `fb` | `123456` |
| Teknik Direktör | `bjk` | `123456` |

## Local Development

Backend:

```bash
cp .env.example .env
npm install
npm run dev
```

Frontend:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Local vars:

```env
MONGO_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/turco-manager
JWT_SECRET=long-random-local-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
VITE_API_URL=http://localhost:5000/api
```

## Frontend Vercel Deploy

Vercel project ayarları:

- GitHub repo: `https://github.com/tahagurvardar/TurcoManager`
- Production branch: `main`
- Root Directory: `frontend`
- Framework Preset: `Vite`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

Frontend environment variable:

```env
VITE_API_URL=https://YOUR-BACKEND-URL/api
```

`frontend/vercel.json` Vite SPA deep-link rewrite ve build ayarlarını içerir. GitHub main branch'e her push sonrası Vercel otomatik deployment alır.

## Backend Deploy

Bu backend Express + MongoDB bağlantısı ve simülasyon servisleriyle sürekli çalışan Node servisine daha uygundur. Bu nedenle önerilen demo stratejisi:

1. Frontend: Vercel
2. Backend API: Render veya Railway
3. Database: MongoDB Atlas

Render için `render.yaml` eklendi.

Render ayarları:

- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/api/health`

Backend environment variables:

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/turco-manager
JWT_SECRET=long-random-production-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173,https://YOUR-VERCEL-DEMO.vercel.app
```

`PORT` genelde platform tarafından atanır. Local kullanımda `PORT=5000` verilebilir.

## CORS

Backend `CLIENT_URL` değerini virgülle ayrılmış origin listesi olarak okur:

```env
CLIENT_URL=http://localhost:5173,https://YOUR-VERCEL-DEMO.vercel.app
```

Development modunda localhost Vite originleri otomatik izinlidir. Production'da Vercel domainini `CLIENT_URL` içine ekleyin.

## Demo Seed

Production'da seed otomatik çalışmaz.

Güvenli demo seed komutu:

```bash
npm run seed:demo
```

Bu komut mevcut demo verisi varsa reset yapmadan durur. Bilerek sıfırlamak için:

```bash
npm run seed:demo -- --reset
```

Seed içeriği:

- Takımlar
- Oyuncular
- Fikstür
- Demo maç kayıtları

Deploy build/start komutlarına seed eklemeyin. Aksi halde her deploy veriyi sıfırlayabilir.

## Required Environment Variables

Frontend:

- `VITE_API_URL`

Backend:

- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLIENT_URL`
- `PORT` optional

Secrets dosyaya yazılmamalıdır. `.env`, `.env.local` ve frontend env dosyaları `.gitignore` içindedir. Sadece `.env.example` dosyaları commit edilir.

## Demo Deploy Checklist

- MongoDB Atlas cluster oluşturuldu.
- Backend Render/Railway üzerinde deploy edildi.
- Backend env vars girildi: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`.
- Backend health check geçti: `/api/health`.
- Demo seed bir kez manuel çalıştırıldı: `npm run seed:demo`.
- Frontend Vercel projesi `frontend` root directory ile bağlandı.
- Vercel env var girildi: `VITE_API_URL=https://YOUR-BACKEND-URL/api`.
- Backend `CLIENT_URL` içine Vercel demo domaini eklendi.
- GitHub `main` push sonrası Vercel otomatik deploy alıyor.

## Notes

Backend Vercel serverless'a taşınabilir, fakat bu repo için ana öneri sürekli çalışan Node hostingidir. Express app `src/server.js` içinde export edilir ve import/syntax smoke testleri desteklenir.
