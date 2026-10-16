---
name: logistics-platform
description: Work on the Fleetline Logistics full-stack application in this repository, including its React web app, Express API, local MongoDB demo, and Postman workflow.
---

# Fleetline Logistics project workflow

- Read the root `README.md`, then the relevant guide in `docs/` before making broad changes. Use `docs/API.md` for routes and `docs/LEARNING_PATH.md` when the user wants an explanation.
- The repository is an npm workspace. The API lives in `apps/api`; the Vite web app lives in `apps/web`.
- For the no-Docker demo, start the API with `npm run dev:local -w @logistics/api` and the web app with `npm run dev:web`. The API serves port 4000 and the web app port 5173.
- The local demo API starts a temporary MongoDB server on port 27018 with database `logistics_dev`. It is in-memory and its data disappears when the API stops. MongoDB Compass can connect to `mongodb://127.0.0.1:27018/logistics_dev` while the API is running.
- Use `postman/Fleetline-Local-API.postman_collection.json` for the local API requests. Its base URL is `http://localhost:4000`.
- Distinguish seeded/demo database records from static dashboard sample data. Do not describe UI sample data as persisted MongoDB records unless you verify it through the API/database.
- Keep explanations accessible and step-by-step when the user asks to learn. Prefer small changes that fit the existing structure and security patterns; do not expose secrets or put credentials in tracked files.
