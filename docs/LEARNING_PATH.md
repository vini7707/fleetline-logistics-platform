# Logistics platform: step-by-step guide

## 1. Workspace and request path

`apps/web` is the React client; `apps/api` is the Express server. A web page calls an API route, the route checks the user and validates input, a service applies a business rule, then Mongoose stores the result. Keep each responsibility separate so a screen cannot bypass server-side rules.

## 2. Organizations and users

Every operational collection includes `organizationId`. The API reads that value from the authenticated session and adds it to each query. This is the foundation for tenant isolation: a user should never choose which tenant's records a protected request can read by changing a request body.

The admin seed command creates one organization and its first admin. New users can then be added through the admin API. Passwords are transformed using Argon2id before storage; login never returns the hash.

## 3. Sessions and roles

Login creates a short-lived access token and a long-lived random refresh secret. Only a hash of the refresh secret is stored in MongoDB. Refresh replaces it on every use, which means a replayed old token can be detected and sessions revoked. The access token identifies the user, organization, role, and session; protected routes also check that the session and account remain active.

Roles provide broad permissions. Resource ownership checks narrow access further: customers only see their own shipments; drivers act only on their assigned trips. The user interface can hide actions, but the API is the authority.

## 4. Shipment and trip

A shipment describes the customer's goods and endpoints. A trip describes the assigned physical operation. The state-transition map on the server rejects impossible changes. Assignment checks that resources are available and that no active trip already uses the driver or vehicle.

## 5. Tracking and proof

A driver sends latitude/longitude with an authenticated request. The server derives the driver from the account, validates the time and coordinates, records history, updates the current point, and broadcasts within an authorized trip room. A public tracking URL is a capability: the secret token is random and only its hash is stored.

Proof of delivery is associated with the exact assigned trip and records recipient/time/location. Production use needs actual private object storage integration for photos/signatures; the starter currently stores references only.

## 6. Local run

Install Node.js 20+, copy `.env.example` to `.env`, set local secrets, then run `docker compose up -d mongo redis`. Install dependencies with `npm install`; run `npm run dev:api` and `npm run dev:web` in separate terminals. The API listens on port 4000 and the frontend on 5173. Seed the first admin with `npm run seed:admin -w @logistics/api -- "Demo Logistics" admin@example.com "a-long-local-password"`.

Read `API.md` for routes and `PRODUCTION_READINESS.md` for what still needs vendor setup and review. This project deliberately does not claim the remaining production integrations exist.

## 7. Use shipments, trips, and live tracking in the web app

1. Sign in as an admin, dispatcher, or customer and open **Shipments**. Choose **Create shipment**, enter pickup and delivery addresses plus goods, then submit. The screen calls `POST /api/v1/shipments`; the API validates and stores the booking, then returns its tracking code.
2. Admins and dispatchers can choose **Assign trip** for a booked shipment. Select an available driver and vehicle. The screen calls `POST /api/v1/shipments/:id/assign`, which creates a trip and marks those resources as assigned.
3. The assigned driver opens **Trips**, accepts the assignment, and starts it. These actions call `POST /api/v1/trips/:id/accept` and `POST /api/v1/trips/:id/start`.
4. While the trip is in progress, the driver can choose **Share my current location**. The browser asks for location permission and submits the coordinates to `POST /api/v1/tracking/location`.
5. Open **Live tracking** as a dispatcher or another authorized user. The screen reads `GET /api/v1/tracking/trips/:tripId` every ten seconds and plots the returned GPS history. This is a coordinate plot, not a street map; production map tiles require a configured map provider.

The trip workflow needs available driver and vehicle records first. Tracking appears after a trip is in progress and the driver submits a location update. The local demo database is temporary, so its records disappear when the API process stops.
