# AURA

AURA is a personal fashion, beauty, skincare, and haircare recommendation platform. The backend and Expo mobile app are separate applications and can be installed and run independently.

## Requirements

- Node.js 18 or newer
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

Set `MONGODB_URI` in `aura-backend/.env` to your MongoDB connection string. The API starts without a database URI for local scaffolding work and logs that it is running in that mode. With the default port, the health endpoint is `http://localhost:5000/api/health`.

Use `npm start` to run the backend without Nodemon.

## Mobile

```powershell
cd aura-mobile
npm install
Copy-Item .env.example .env
npm start
```

Use the Expo terminal shortcuts or `npm run android`, `npm run ios`, or `npm run web` to choose a target. Set `EXPO_PUBLIC_API_URL` in `aura-mobile/.env` to the backend API URL reachable from your device or simulator.

## Environment and structure

Each app owns its dependencies and scripts. Local `.env` files are ignored by Git; `.env.example` files document the non-secret configuration keys.

- `aura-backend/src`: Express app, database config, and MVC-ready folders
- `aura-mobile/src`: screens, navigation, and feature-ready folders
