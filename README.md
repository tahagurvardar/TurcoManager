# TurcoManager

Football manager / teknik direktör simülasyonu.

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB Atlas / MongoDB
- Auth: JWT

## Demo URL

- Frontend demo: `https://turcomanagerfronted.vercel.app`
- Backend API: `https://turcomanager-api.onrender.com`
- Health check: `https://turcomanager-api.onrender.com/api/health`

## Demo Hesapları

Bu hesaplar sadece demo ortamı içindir.

| Rol | Kullanıcı | Şifre |
| --- | --- | --- |
| Admin | `admin` | `123456` |
| Teknik Direktör | `gs` | `123456` |
| Teknik Direktör | `fb` | `123456` |
| Teknik Direktör | `bjk` | `123456` |

---

# Local Development

## Backend

```bash
cp .env.example .env
npm install
npm run dev
```

## Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Local Environment Variables

```env
MONGO_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/turco-manager
JWT_SECRET=long-random-local-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
VITE_API_URL=http://localhost:5000/api
```

---

# Frontend Deploy (Vercel)

## Vercel Settings

- GitHub repo:
  `https://github.com/tahagurvardar/TurcoManager`

- Production branch:
  `main`

- Root Directory:
  `frontend`

- Framework Preset:
  `Vite`

- Install Command:
  `npm install`

- Build Command:
  `npm run build`

- Output Directory:
  `dist`

## Frontend Environment Variable

```env
VITE_API_URL=https://turcomanager-api.onrender.com/api
```

GitHub `main` branch’e her push sonrası Vercel otomatik deployment alır.

---

# Backend Deploy (Render)

TurcoManager backend’i sürekli çalışan Node.js servis modeliyle çalışır.

Kullanılan production stack:

1. Frontend → Vercel
2. Backend API → Render
3. Database → MongoDB Atlas

## Render Settings

- Build Command:

```bash
npm install
```

- Start Command:

```bash
npm start
```

- Health Check Path:

```txt
/api/health
```

## Backend Environment Variables

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/turco-manager
JWT_SECRET=long-random-production-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173,https://turco-manager.vercel.app,https://turcomanagerfronted.vercel.app
PORT=10000
```

---

# CORS

Backend `CLIENT_URL` değerini virgülle ayrılmış origin listesi olarak okur.

Örnek:

```env
CLIENT_URL=http://localhost:5173,https://turco-manager.vercel.app,https://turcomanagerfronted.vercel.app
```

---

# Demo Seed

Production ortamında seed otomatik çalışmaz.

## Demo seed çalıştırma

```bash
npm run seed:demo
```

## Database resetleyerek seed çalıştırma

```bash
npm run seed:demo -- --reset
```

## Seed içeriği

- Takımlar
- Oyuncular
- Fikstür
- Demo maç kayıtları
- Demo kullanıcı hesapları

---

# Required Environment Variables

## Frontend

```env
VITE_API_URL
```

## Backend

```env
MONGO_URI
JWT_SECRET
JWT_EXPIRES_IN
CLIENT_URL
PORT
NODE_ENV
```

Secrets hiçbir zaman GitHub’a pushlanmamalıdır.

`.env` dosyaları `.gitignore` içindedir.

---

# Demo Deploy Checklist

- MongoDB Atlas cluster oluşturuldu
- Backend Render üzerinde deploy edildi
- Backend environment variables girildi
- Frontend Vercel deploy edildi
- Backend health check başarılı
- Demo seed çalıştırıldı
- Frontend backend API’ye bağlı
- GitHub push sonrası otomatik deploy aktif

---

# Production URLs

## Frontend

```txt
https://turcomanagerfronted.vercel.app
```

## Backend API

```txt
https://turcomanager-api.onrender.com
```

## Health Check

```txt
https://turcomanager-api.onrender.com/api/health
```

---

# Notes

Backend Vercel serverless yapısına taşınabilir ancak TurcoManager için önerilen yapı sürekli çalışan Node.js servisidir.

Express app:

```txt
src/server.js
```

üzerinden export edilir ve Render deployment modeliyle uyumludur.


## License

This project is proprietary software.

Unauthorized use, copying, modification, distribution, or commercial usage is strictly prohibited.

Copyright (c) 2026 Taha Gürvardar.
All rights reserved.

This source code may not be copied, modified, distributed, sublicensed, or used commercially without explicit permission.
