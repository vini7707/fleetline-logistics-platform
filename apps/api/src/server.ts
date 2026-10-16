import { createServer } from "node:http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { Driver, Shipment, Trip, Session, User } from "./models/index.js";
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: env.WEB_ORIGIN, credentials: true },
});
app.set("io", io);
const secret =
  process.env.JWT_ACCESS_SECRET ?? "local-development-secret-change-this-value";
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (typeof token !== "string") return next(new Error("unauthorized"));
    const claims = jwt.verify(token, secret, {
      issuer: "logistics-api",
      audience: "logistics-web",
    }) as jwt.JwtPayload;
    if (!claims.sub || !claims.org || !claims.role || !claims.sid)
      return next(new Error("unauthorized"));
    const [session, user] = await Promise.all([
      Session.exists({
        _id: claims.sid,
        userId: claims.sub,
        organizationId: claims.org,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      }),
      User.exists({
        _id: claims.sub,
        organizationId: claims.org,
        status: "ACTIVE",
      }),
    ]);
    if (!session || !user) return next(new Error("unauthorized"));
    socket.data.auth = {
      userId: String(claims.sub),
      organizationId: String(claims.org),
      role: String(claims.role),
    };
    next();
  } catch {
    next(new Error("unauthorized"));
  }
});
io.on("connection", (socket) => {
  const auth = socket.data.auth as {
    userId: string;
    organizationId: string;
    role: string;
  };
  socket.on(
    "tracking:subscribe",
    async (tripId: unknown, acknowledge?: (ok: boolean) => void) => {
      if (typeof tripId !== "string" || tripId.length > 64)
        return acknowledge?.(false);
      const trip = await Trip.findOne({
        _id: tripId,
        organizationId: auth.organizationId,
      });
      if (!trip) return acknowledge?.(false);
      let permitted = [
        "SUPER_ADMIN",
        "ADMIN",
        "DISPATCHER",
        "AUDITOR",
      ].includes(auth.role);
      if (auth.role === "DRIVER")
        permitted = Boolean(
          await Driver.exists({
            _id: trip.driverId,
            userId: auth.userId,
            organizationId: auth.organizationId,
          }),
        );
      if (auth.role === "CUSTOMER")
        permitted = Boolean(
          await Shipment.exists({
            _id: trip.shipmentId,
            customerId: auth.userId,
            organizationId: auth.organizationId,
          }),
        );
      if (!permitted) return acknowledge?.(false);
      socket.join(`org:${auth.organizationId}:trip:${tripId}`);
      acknowledge?.(true);
    },
  );
});
await connectDatabase();
server.listen(env.PORT, () =>
  console.log(`Logistics API listening on http://localhost:${env.PORT}`),
);
