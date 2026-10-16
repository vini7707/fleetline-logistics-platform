import { Router } from "express";
import { Driver, Vehicle, Owner } from "../../models/index.js";
import { authenticate, allowRoles } from "../../middleware/auth.js";
import { z } from "zod";
import { audit } from "../audit/audit.service.js";
const router = Router();
router.use(authenticate);
const org = (req: any) => req.auth.organizationId;
router.get(
  "/drivers",
  allowRoles("SUPER_ADMIN", "ADMIN", "DISPATCHER", "OWNER", "AUDITOR"),
  async (req, res, next) => {
    try {
      const q: any = { organizationId: org(req) };
      if (req.auth!.role === "OWNER") {
        const owner = await Owner.findOne({
          userId: req.auth!.userId,
          organizationId: org(req),
        });
        q.ownerId = owner?._id ?? null;
      }
      res.json({ data: await Driver.find(q).limit(200) });
    } catch (e) {
      next(e);
    }
  },
);
router.post(
  "/drivers",
  allowRoles("SUPER_ADMIN", "ADMIN", "DISPATCHER"),
  async (req, res, next) => {
    try {
      const v = z
        .object({
          userId: z.string(),
          licenseNumber: z.string().min(3).max(80),
          licenseExpiry: z.coerce.date(),
          ownerId: z.string().optional(),
        })
        .parse(req.body);
      const d = await Driver.create({ ...v, organizationId: org(req) });
      await audit(req, "driver.created", "Driver", d.id);
      res.status(201).json({ data: d });
    } catch (e) {
      next(e);
    }
  },
);
router.get(
  "/vehicles",
  allowRoles("SUPER_ADMIN", "ADMIN", "DISPATCHER", "OWNER", "AUDITOR"),
  async (req, res, next) => {
    try {
      const q: any = { organizationId: org(req) };
      if (req.auth!.role === "OWNER") {
        const owner = await Owner.findOne({
          userId: req.auth!.userId,
          organizationId: org(req),
        });
        q.ownerId = owner?._id ?? null;
      }
      res.json({ data: await Vehicle.find(q).limit(200) });
    } catch (e) {
      next(e);
    }
  },
);
router.post(
  "/vehicles",
  allowRoles("SUPER_ADMIN", "ADMIN", "DISPATCHER", "OWNER"),
  async (req, res, next) => {
    try {
      const v = z
        .object({
          ownerId: z.string(),
          registrationNumber: z.string().min(3).max(24),
          type: z.string().min(2).max(80),
          make: z.string().optional(),
          model: z.string().optional(),
          capacityKg: z.number().min(0).optional(),
        })
        .parse(req.body);
      const row = await Vehicle.create({ ...v, organizationId: org(req) });
      await audit(req, "vehicle.created", "Vehicle", row.id);
      res.status(201).json({ data: row });
    } catch (e) {
      next(e);
    }
  },
);
router.get(
  "/owners",
  allowRoles("SUPER_ADMIN", "ADMIN", "DISPATCHER", "AUDITOR"),
  async (req, res, next) => {
    try {
      res.json({
        data: await Owner.find({ organizationId: org(req) }).limit(200),
      });
    } catch (e) {
      next(e);
    }
  },
);
router.post(
  "/owners",
  allowRoles("SUPER_ADMIN", "ADMIN"),
  async (req, res, next) => {
    try {
      const v = z
        .object({
          name: z.string().min(2).max(160),
          userId: z.string().optional(),
          phone: z.string().max(40).optional(),
        })
        .parse(req.body);
      const o = await Owner.create({ ...v, organizationId: org(req) });
      await audit(req, "owner.created", "Owner", o.id);
      res.status(201).json({ data: o });
    } catch (e) {
      next(e);
    }
  },
);
export default router;
