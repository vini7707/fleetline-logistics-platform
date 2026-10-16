import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "./errors.js";
import { Session, User } from "../models/index.js";
const secret = process.env.JWT_ACCESS_SECRET;
if (!secret || secret.length < 32) {
  if (env.NODE_ENV === "production")
    throw new Error("JWT_ACCESS_SECRET must be configured (32+ chars)");
}
export const authenticate: RequestHandler = async (req, _res, next) => {
  const token = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : undefined;
  if (!token)
    return next(new AppError(401, "UNAUTHENTICATED", "Sign in to continue"));
  try {
    const c = jwt.verify(
      token,
      secret ?? "local-development-secret-change-this-value",
      { issuer: "logistics-api", audience: "logistics-web" },
    ) as jwt.JwtPayload;
    if (!c.sub || !c.org || !c.sid || !c.role)
      throw new Error("invalid claims");
    const session = await Session.exists({
      _id: c.sid,
      userId: c.sub,
      organizationId: c.org,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });
    const user = await User.exists({
      _id: c.sub,
      organizationId: c.org,
      status: "ACTIVE",
    });
    if (!session || !user) throw new Error("session revoked");
    req.auth = {
      userId: String(c.sub),
      organizationId: String(c.org),
      sessionId: String(c.sid),
      role: String(c.role),
    };
    next();
  } catch {
    next(
      new AppError(401, "INVALID_TOKEN", "Your session is invalid or expired"),
    );
  }
};
export const allowRoles =
  (...roles: string[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.auth || !roles.includes(req.auth.role))
      return next(
        new AppError(403, "FORBIDDEN", "You do not have access to this action"),
      );
    next();
  };
