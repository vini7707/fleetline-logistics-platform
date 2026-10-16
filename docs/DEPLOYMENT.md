# Deploy Fleetline Logistics

This repository includes a Render Blueprint for the API and web app. The MongoDB database is configured separately so its connection string stays in Render's environment settings and never enters Git.

## Before deploying

- Create a persistent MongoDB database, for example a MongoDB Atlas cluster, and create a database user with access to the application database. Allow network access from Render as required by the database provider. Copy the database connection string, replacing its username, password, and database name.
- Sign in to GitHub and create a public repository for this project. Keep `.env` and all credentials out of the repository.
- In Render, create a Blueprint from the GitHub repository and select `render.yaml`.

## Configure the Blueprint

Render will request these values because they are marked `sync: false`:

- API `MONGODB_URI`: the database connection string from the database provider.
- API `WEB_ORIGIN`: the public origin for the Render static site, such as `https://fleetline-logistics-web.onrender.com`.
- Web `VITE_API_URL`: the API base URL, including `/api/v1`, such as `https://fleetline-logistics-api.onrender.com/api/v1`.

The Blueprint generates `JWT_ACCESS_SECRET` in Render and sets `NODE_ENV=production`. Keep the web and API URLs in sync if Render assigns different service URLs. Deploy the API and web services, then open the public web URL and check `<API URL>/health`.

## After deploy

Create the first administrator with the API's seed script or the appropriate admin setup flow. Do not use a demo password or share a production administrator password in source control. The seed script runs from `apps/api` and needs `MONGODB_URI` configured in the same environment.

This project is an implementation foundation, not a production-certified logistics service. Review [the production readiness checklist](PRODUCTION_READINESS.md) before using real customer or shipment data. Email and SMS verification, password reset, MFA, private proof-of-delivery storage, actual maps and ETA, monitoring, backup restore drills, and broader workflow coverage still need implementation and provider setup.
