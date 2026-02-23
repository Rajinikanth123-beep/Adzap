# ADZAP Backend

## Run

1. Install dependencies: `npm install`
2. Start backend: `npm run backend:start`
3. Dev mode (auto-restart): `npm run backend:dev`

Backend default URL: `http://localhost:5000`

## Environment Variables

- `PORT` (default `5000`)
- `CORS_ORIGIN` (comma-separated allowlist, default `*`)
- `MONGODB_URI` (optional, recommended for production)

## Storage Mode

- If `MONGODB_URI` is set: uses MongoDB (recommended for multi-device/public use).
- If `MONGODB_URI` is not set: uses local file storage at `backend/data/store.json` (local/dev only).

## Production Setup (All Users / All Devices)

1. Deploy backend to a public host (Render/Railway/Fly/VPS).
2. Set backend env vars:
   - `MONGODB_URI=<your-mongodb-connection-string>`
   - `CORS_ORIGIN=https://adzap-lilac.vercel.app`
3. Verify backend health: `GET https://<backend-domain>/api/health`
4. In Vercel frontend env set:
   - `REACT_APP_API_BASE_URL=https://<backend-domain>`
5. Redeploy frontend.

## 2-Minute Render Deploy

1. Push this repo with `render.yaml` to GitHub.
2. In Render: `New` -> `Blueprint` -> select your repo.
3. Render creates `adzap-backend` automatically from `render.yaml`.
4. In Render service settings, set:
   - `MONGODB_URI=<your-mongodb-connection-string>`
5. Deploy and confirm:
   - `https://<your-render-domain>/api/health`
6. In Vercel env set:
   - `REACT_APP_API_BASE_URL=https://<your-render-domain>`
   - `REACT_APP_ALLOW_LOCAL_FALLBACK=false`
7. Redeploy Vercel project.

## Main Endpoints

- `GET /api/health`
- `GET /api/bootstrap`
- `POST /api/contact-messages`
- `POST /api/teams/register`
- `PUT /api/teams`
- `POST /api/auth/participant/login`
- `POST /api/auth/admin/register`
- `POST /api/auth/admin/login`
- `POST /api/auth/judge/register`
- `POST /api/auth/judge/login`
