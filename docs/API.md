# API map (v1)

## Call the local API

The running API base URL is `http://127.0.0.1:4000/api/v1`. Check it first with `GET /health`. Import [`Fleetline-Local-API.postman_collection.json`](../postman/Fleetline-Local-API.postman_collection.json) into Postman, set the collection variables `email` and `password` to the demo credentials printed when the local API started, then send **Login**. The collection saves the returned access token so you can call protected routes. The running demo credentials are shown in the chat where the server was started.

Example health check:

```sh
curl http://127.0.0.1:4000/api/v1/health
```

Example login (substitute the local demo credentials):

```sh
curl -i -c cookies.txt -H 'Content-Type: application/json' \
  -d '{"email":"YOUR_DEMO_EMAIL","password":"YOUR_DEMO_PASSWORD"}' \
  http://127.0.0.1:4000/api/v1/auth/login
```

All protected routes use `Authorization: Bearer <accessToken>`. The access token lasts 15 minutes; the rotating refresh token is an HttpOnly, Secure-in-production, SameSite=Strict cookie scoped to `/api/v1/auth`.

| Area              | Routes                                                                | Access                                                |
| ----------------- | --------------------------------------------------------------------- | ----------------------------------------------------- |
| Health            | `GET /api/v1/health`                                                  | Public                                                |
| Auth              | `POST /api/v1/auth/login`, `POST /refresh`, `POST /logout`, `GET /me` | Login/refresh public; logout/me authenticated         |
| Shipments         | `GET/POST /api/v1/shipments`, `POST /:id/assign`, `PATCH /:id/status` | Roles checked server-side; customer reads own records |
| Public tracking   | `GET /api/v1/shipments/public/:code/:token`                           | Unguessable capability token                          |
| Trips             | `GET /api/v1/trips`, `POST /:id/accept`, `POST /:id/start`            | Authenticated; driver assignment checked              |
| Tracking          | `POST /api/v1/tracking/location`, `GET /trips/:tripId`                | Driver writes; scoped reads                           |
| Fleet             | `GET/POST /api/v1/drivers`, `/vehicles`, `/owners`                    | Admin/dispatcher/owner role gates                     |
| Proof of delivery | `POST /api/v1/proof-of-delivery/:shipmentId`                          | Assigned driver only                                  |
| Notifications     | `GET /api/v1/notifications`, `POST /:id/read`                         | Current user only                                     |
| Administration    | `/api/v1/admin/users`, `/audit`, `/reports/summary`                   | Admin/Super Admin                                     |

Errors use `{ error: { code, message, requestId } }`. Request bodies are Zod validated; organizations are added to database filters from the access token, never accepted from arbitrary user input. The route list describes the implemented starter API; see the deployment guide for features needing vendor configuration.
