# Fleetline Logistics

A step-by-step full-stack logistics platform project using React, TypeScript, Express, MongoDB, JWT sessions, and Socket.IO.

## What is implemented

- React marketing homepage, responsive operations dashboard, API-backed shipment creation and listing, driver/vehicle trip assignment, trip accept/start actions, and polling GPS tracking view.
- Express API with health checks, request IDs, security headers, CORS allowlist, rate limiting, validation, and centralized errors.
- MongoDB models and indexes for organizations, users, sessions, drivers, owners, vehicles, shipments, trips, GPS history, audit, notifications, and proof of delivery.
- Tenant-scoped RBAC; Argon2id password hashes; 15-minute access tokens; rotated opaque refresh tokens in HttpOnly cookies; server-side revocation.
- Shipment state machine, resource assignment checks, trip accept/start, live location storage and authorized Socket.IO trip rooms, customer shipment tracking links, POD records, admin routes and reports.
- Docker Compose baseline for MongoDB/Redis and container files, API map, learning guide, and production readiness checklist.

This is an implementation foundation, not yet a production-certified system. Review [the production readiness checklist](docs/PRODUCTION_READINESS.md) before using real data. In particular, email/SMS verification and reset, MFA, private S3 file storage, actual map/ETA integrations, payment/invoice, document expiry notifications, and exhaustive workflow tests still need implementation and vendor configuration. The frontend now includes a public logistics marketing site, API-backed login and registration, and an operations dashboard shell; role-specific operations screens are still under development.

## Run locally

For a quick demo without Docker or a MongoDB server, start the temporary database and API in one terminal with `npm run dev:local -w @logistics/api`, then start the web app in a second terminal with `npm run dev:web`. The temporary database is erased when the API process stops. Connect MongoDB Compass to `mongodb://127.0.0.1:27018/logistics_dev` while it is running. Import `postman/Fleetline-Local-API.postman_collection.json` into Postman to call the API. A demo administrator email and password are printed at API startup.

For persistent local MongoDB instead, use the Docker steps below.

1. Install Node.js 20+ and Docker.
2. Copy `.env.example` to `.env` and replace every placeholder with a unique local secret.
3. Run `docker compose up -d mongo redis`.
4. Run `npm install` from this directory.
5. In one terminal run `npm run dev:api`; in another run `npm run dev:web`.
6. Seed an initial admin: `npm run seed:admin -w @logistics/api -- "Demo Logistics" admin@example.com "a-long-local-password"`.
7. Open `http://localhost:5173`; check `http://localhost:4000/api/v1/health`.

Follow [the learning path](docs/LEARNING_PATH.md) to understand the design in order, and [the API map](docs/API.md) to explore implemented routes.

For GitHub and Render deployment, follow the [deployment guide](docs/DEPLOYMENT.md). The Render Blueprint expects a persistent MongoDB connection string to be supplied through Render's environment settings.
