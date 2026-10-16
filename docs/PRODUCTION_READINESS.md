# Deployment and security checklist

## Implemented foundations

- Argon2id password hashes, short lived signed access JWTs, refresh-token rotation, server-side session revocation, and HttpOnly refresh cookies.
- Tenant-bound database records and queries, role gates, shipment owner filtering, per-user notification filtering, and tracking room checks.
- Helmet headers, CORS allowlist, JSON body limit, login rate limiting, Zod validation, MongoDB validation, request IDs, and structured error responses.
- Audit records for core authentication and operations, private-data filtering from the login response, geospatial indexes, and a Docker Compose baseline.

## Required before real customer data

1. Set a unique strong `JWT_ACCESS_SECRET`, database and Redis credentials, TLS termination, and a production `WEB_ORIGIN` in a managed secrets store. Never commit `.env` files.
2. Put MongoDB on a private network with authentication, TLS, encrypted storage, least-privilege accounts, automated backups, and a tested restore exercise.
3. Configure an email/SMS provider for verification, password reset, MFA, alerts, and OTP delivery. Those workflows are not implemented in this starter.
4. Configure private S3-compatible storage and signed upload/download URLs. The current proof-of-delivery endpoint accepts object keys, but does not upload files or validate that those objects exist; do not expose it for production use until storage checks are added.
5. Connect a map/route provider; the current dashboard map is a visual placeholder and ETA/distance are not computed.
6. Add tested workflow coverage, race-safe transactional trip assignment, pagination, retention policies for GPS data, GPS anomaly detection, and alerting.
7. Review all organization/customer/owner visibility rules with the business. Add MFA and permission granularity for privileged roles. The listed role gates are an initial RBAC baseline.
8. Add reverse proxy TLS, request size and connection limits, backups, health/readiness probes, uptime monitoring, log redaction, vulnerability scanning, and incident response procedures.

Redis is included in Compose as a future queue/cache dependency; current API behavior does not depend on it. Payments/invoices, document-expiry alerts, session/device management UI, password reset, email/phone verification, MFA enrollment, and exports remain follow-on work. Do not label this starter production-ready until the checklist is complete for the actual deployment.
