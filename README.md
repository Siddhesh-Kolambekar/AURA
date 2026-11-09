# AURA

AURA is a personal fashion, beauty, skincare, and haircare recommendation platform. The backend and Expo mobile app are separate applications and can be installed and run independently.

## Requirements

- Node.js 20 or newer
- npm
- MongoDB for database-backed API development
- Expo Go or an iOS/Android simulator for the mobile app

## Backend

```powershell
cd aura-backend
npm install
Copy-Item .env.example .env
npm run dev
```

Set `MONGODB_URI` in `aura-backend/.env` to your MongoDB connection string and set `JWT_SECRET` to a random secret of at least 32 bytes. `JWT_EXPIRES_IN` controls token lifetime (defaults to `1d`). The backend requires a successful MongoDB connection before it starts listening. With the default port, the health endpoint is `http://localhost:5000/api/v1/health`. Set `CORS_ORIGIN` to a comma-separated list of permitted development origins if you need to change the defaults.

Password recovery uses one-time, hashed reset tokens that expire after 15 minutes by default. Configure `PASSWORD_RESET_URL` and SMTP settings (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and `MAIL_FROM`) to deliver reset emails. Reset responses do not reveal whether an account exists. Logout revokes the presented JWT server-side until its expiry; MongoDB automatically removes expired revocation records.

Use `npm start` to run the backend without Nodemon.

## Mobile

```powershell
cd aura-mobile
npm install
Copy-Item .env.example .env
npm start
```

Use the Expo terminal shortcuts or `npm run android`, `npm run ios`, or `npm run web` to choose a target. Set `EXPO_PUBLIC_API_URL` in `aura-mobile/.env` to the backend API URL reachable from your device or simulator (for example, `http://localhost:5000/api/v1`).

## Environment and structure

Each app owns its dependencies and scripts. Local `.env` files are ignored by Git; `.env.example` files document the non-secret configuration keys.

- `aura-backend/src`: Express app, database config, and MVC-ready folders
- `aura-mobile/src`: screens, navigation, and feature-ready folders
