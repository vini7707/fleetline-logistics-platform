import { Router } from "express";
import argon2 from "argon2";
import { z } from "zod";
import { Types } from "mongoose";
import {
  User,
  AuditLog,
  Shipment,
  Trip,
  Driver,
  Vehicle,
  Session,
} from "../../models/index.js";
import { authenticate, allowRoles } from "../../middleware/auth.js";
import { AppError } from "../../middleware/errors.js";
import { audit } from "../audit/audit.service.js";
const router = Router();
router.use(authenticate, allowRoles("SUPER_ADMIN", "ADMIN"));
router.get("/users", async (req, res, next) => {
  try {
    res.json({
      data: await User.find({ organizationId: req.auth!.organizationId })
        .select("name email role status mfaEnabled createdAt")
        .limit(300),
    });
  } catch (e) {
    next(e);
  }
});
router.post("/users", async (req, res, next) => {
  try {
    const v = z
      .object({
        name: z.string().min(2).max(160),
        email: z.string().email(),
        password: z.string().min(12).max(128),
        role: z.enum([
          "ADMIN",
          "DISPATCHER",
          "OWNER",
          "DRIVER",
          "CUSTOMER",
          "AUDITOR",
        ]),
      })
      .parse(req.body);
    if (req.auth!.role === "ADMIN" && v.role === "ADMIN")
      throw new AppError(
        403,
        "FORBIDDEN",
        "Only a super admin can create another admin",
      );
    const user = await User.create({
      organizationId: req.auth!.organizationId,
      name: v.name,
      email: v.email,
      passwordHash: await argon2.hash(v.password, { type: argon2.argon2id }),
      role: v.role,
    });
    await audit(req, "user.created", "User", user.id, { role: user.role });
    res.status(201).json({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (e) {
    next(e);
  }
});
router.patch("/users/:id/status", async (req, res, next) => {
  try {
    const status = z.enum(["ACTIVE", "SUSPENDED"]).parse(req.body.status);
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.auth!.organizationId },
      { $set: { status } },
      { new: true },
    ).select("name email role status");
    if (!user) throw new AppError(404, "USER_NOT_FOUND", "User not found");
    await Session.updateMany(
      { userId: user._id, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
    await audit(req, "user.status_changed", "User", user.id, { status });
    res.json({ data: user });
  } catch (e) {
    next(e);
  }
});
router.get("/audit", async (req, res, next) => {
  try {
    const filter: any = { organizationId: req.auth!.organizationId };
    if (req.query.action) filter.action = String(req.query.action);
    res.json({
      data: await AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .limit(Math.min(Number(req.query.limit) || 100, 500)),
    });
  } catch (e) {
    next(e);
  }
});
router.get("/reports/summary", async (req, res, next) => {
  try {
    const organizationId = new Types.ObjectId(req.auth!.organizationId);
    const [shipments, activeTrips, availableDrivers, availableVehicles] =
      await Promise.all([
        Shipment.aggregate([
          { $match: { organizationId } },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        Trip.countDocuments({
          organizationId,
          status: { $in: ["ASSIGNED", "ACCEPTED", "IN_PROGRESS"] },
        }),
        Driver.countDocuments({ organizationId, status: "AVAILABLE" }),
        Vehicle.countDocuments({ organizationId, status: "AVAILABLE" }),
      ]);
    res.json({
      data: {
        shipmentsByStatus: shipments,
        activeTrips,
        availableDrivers,
        availableVehicles,
      },
    });
  } catch (e) {
    next(e);
  }
});
export default router;
