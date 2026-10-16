import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { healthRouter } from "./modules/health/health.routes.js";
import authRouter from "./modules/auth/auth.routes.js";
import shipmentRouter from "./modules/shipments/shipment.routes.js";
import tripRouter from "./modules/trips/trip.routes.js";
import trackingRouter from "./modules/tracking/tracking.routes.js";
import resourceRouter from "./modules/resources/resource.routes.js";
import podRouter from "./modules/pod/pod.routes.js";
import notificationRouter from "./modules/notifications/notification.routes.js";
import adminRouter from "./modules/admin/admin.routes.js";
import { requestContext } from "./middleware/request-context.js";
import { errorHandler } from "./middleware/errors.js";
export const app = express();
app.disable("x-powered-by");
app.use(requestContext);
app.use(helmet());
app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(
  "/api/v1/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
  authRouter,
);
app.use("/api/v1/health", healthRouter);
app.use("/api/v1/shipments", shipmentRouter);
app.use("/api/v1/trips", tripRouter);
app.use("/api/v1/tracking", trackingRouter);
app.use("/api/v1", resourceRouter);
app.use("/api/v1/proof-of-delivery", podRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/admin", adminRouter);
app.use((_req, res) =>
  res
    .status(404)
    .json({ error: { code: "NOT_FOUND", message: "Route not found" } }),
);
app.use(errorHandler);
