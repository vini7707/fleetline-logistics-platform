import { Router } from "express";
import { z } from "zod";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { randomBytes, createHash } from "node:crypto";
import { User, Session, AuditLog, Organization } from "../../models/index.js";
import { AppError } from "../../middleware/errors.js";
import { env } from "../../config/env.js";
import { authenticate } from "../../middleware/auth.js";
import { audit } from "../audit/audit.service.js";
const router = Router();
const accessSecret =
  env.JWT_ACCESS_SECRET ?? "local-development-secret-change-this-value";
const refreshDays = 30;
const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(256),
});
const registerSchema = z.object({
  name: z.string().trim().min(2).max(160),
  organizationName: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(254),
  password: z.string().min(12).max(256),
});
function hash(v: string) {
  return createHash("sha256").update(v).digest("hex");
}
function issue(user: any, sessionId: string) {
  return jwt.sign(
    { org: String(user.organizationId), role: user.role, sid: sessionId },
    accessSecret,
    {
      subject: String(user._id),
      expiresIn: "15m",
      issuer: "logistics-api",
      audience: "logistics-web",
    },
  );
}
router.post("/register", async (req, res, next) => {
  let organizationId: string | undefined;
  try {
    const input = registerSchema.parse(req.body);
    const email = input.email.toLowerCase();
    if (await User.exists({ email }))
      throw new AppError(
        409,
        "EMAIL_IN_USE",
        "An account with this email already exists",
      );
    const slug = `${
      input.organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40) || "fleet"
    }-${randomBytes(4).toString("hex")}`;
    const organization = await Organization.create({
      name: input.organizationName,
      slug,
    });
    organizationId = String(organization._id);
    const user = await User.create({
      organizationId: organization._id,
      name: input.name,
      email,
      passwordHash: await argon2.hash(input.password, {
        type: argon2.argon2id,
      }),
      role: "ADMIN",
    });
    const raw = randomBytes(48).toString("base64url");
    const session = await Session.create({
      userId: user._id,
      organizationId: organization._id,
      refreshHash: hash(raw),
      expiresAt: new Date(Date.now() + refreshDays * 86400000),
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });
    res.cookie("refreshToken", `${session.id}.${raw}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/v1/auth",
      maxAge: refreshDays * 86400000,
    });
    await AuditLog.create({
      organizationId: organization._id,
      userId: user._id,
      action: "auth.register",
      ip: req.ip,
      userAgent: req.get("user-agent"),
      requestId: req.requestId,
    });
    res.status(201).json({
      accessToken: issue(user, session.id),
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: String(organization._id),
      },
    });
  } catch (e) {
    if (organizationId)
      await Organization.findByIdAndDelete(organizationId).catch(() => {});
    next(e);
  }
});
router.post("/login", async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const user = await User.findOne({
      email: input.email.toLowerCase(),
      status: "ACTIVE",
    }).select("+passwordHash");
    if (!user || !(await argon2.verify(user.passwordHash, input.password))) {
      await AuditLog.create({
        organizationId: user?.organizationId,
        action: "auth.login_failed",
        ip: req.ip,
        userAgent: req.get("user-agent"),
        requestId: req.requestId,
      });
      throw new AppError(
        401,
        "INVALID_CREDENTIALS",
        "Email or password is incorrect",
      );
    }
    const raw = randomBytes(48).toString("base64url");
    const session = await Session.create({
      userId: user._id,
      organizationId: user.organizationId,
      refreshHash: hash(raw),
      expiresAt: new Date(Date.now() + refreshDays * 86400000),
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });
    res.cookie("refreshToken", `${session.id}.${raw}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/v1/auth",
      maxAge: refreshDays * 86400000,
    });
    await AuditLog.create({
      organizationId: user.organizationId,
      userId: user._id,
      action: "auth.login",
      ip: req.ip,
      userAgent: req.get("user-agent"),
      requestId: req.requestId,
    });
    res.json({
      accessToken: issue(user, session.id),
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: String(user.organizationId),
      },
    });
  } catch (e) {
    next(e);
  }
});
router.post("/refresh", async (req, res, next) => {
  try {
    const val = req.cookies?.refreshToken as string | undefined;
    const [id, raw] = val?.split(".") ?? [];
    if (!id || !raw)
      throw new AppError(401, "INVALID_SESSION", "Refresh session is missing");
    const session = await Session.findById(id);
    if (
      !session ||
      session.revokedAt ||
      session.expiresAt.getTime() < Date.now() ||
      session.refreshHash !== hash(raw)
    ) {
      if (session && !session.revokedAt)
        await Session.updateMany(
          { userId: session.userId, revokedAt: null },
          { $set: { revokedAt: new Date() } },
        );
      throw new AppError(
        401,
        "INVALID_SESSION",
        "Refresh session is invalid or expired",
      );
    }
    const user = await User.findOne({
      _id: session.userId,
      organizationId: session.organizationId,
      status: "ACTIVE",
    });
    if (!user)
      throw new AppError(401, "INVALID_SESSION", "Account is unavailable");
    const nextToken = randomBytes(48).toString("base64url");
    session.refreshHash = hash(nextToken);
    session.expiresAt = new Date(Date.now() + refreshDays * 86400000);
    await session.save();
    res.cookie("refreshToken", `${session.id}.${nextToken}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/v1/auth",
      maxAge: refreshDays * 86400000,
    });
    res.json({ accessToken: issue(user, session.id) });
  } catch (e) {
    next(e);
  }
});
router.post("/logout", authenticate, async (req, res, next) => {
  try {
    await Session.findOneAndUpdate(
      { _id: req.auth!.sessionId, userId: req.auth!.userId },
      { $set: { revokedAt: new Date() } },
    );
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/v1/auth",
    });
    await audit(req, "auth.logout");
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});
router.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await User.findOne({
      _id: req.auth!.userId,
      organizationId: req.auth!.organizationId,
    }).select("name email role status");
    if (!user)
      throw new AppError(401, "UNAUTHENTICATED", "Account unavailable");
    res.json({ user });
  } catch (e) {
    next(e);
  }
});
export default router;
