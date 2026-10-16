import { Router } from "express";
import { z } from "zod";
import { randomBytes, createHash } from "node:crypto";
import {
  Shipment,
  Driver,
  Vehicle,
  Trip,
  Notification,
  ProofOfDelivery,
  Owner,
} from "../../models/index.js";
import { authenticate, allowRoles } from "../../middleware/auth.js";
import { AppError } from "../../middleware/errors.js";
import { audit } from "../audit/audit.service.js";
import { canTransitionShipment } from "./shipment.workflow.js";
const router = Router();
const org = (req: any) => req.auth.organizationId;
router.get("/public/:code/:token", async (req, res, next) => {
  try {
    const hash = createHash("sha256").update(req.params.token).digest("hex");
    const row = await Shipment.findOne({
      trackingCode: req.params.code,
      publicTrackingHash: hash,
    }).select(
      "trackingCode status pickup.address delivery.address estimatedDelivery updatedAt",
    );
    if (!row)
      throw new AppError(404, "TRACKING_NOT_FOUND", "Tracking link is invalid");
    res.json({ data: row });
  } catch (e) {
    next(e);
  }
});
const createSchema = z.object({
  pickup: z.object({
    address: z.string().min(3).max(500),
    contactName: z.string().max(120).optional(),
    contactPhone: z.string().max(40).optional(),
    point: z
      .object({
        type: z.literal("Point").default("Point"),
        coordinates: z.tuple([
          z.number().min(-180).max(180),
          z.number().min(-90).max(90),
        ]),
      })
      .optional(),
  }),
  delivery: z.object({
    address: z.string().min(3).max(500),
    contactName: z.string().max(120).optional(),
    contactPhone: z.string().max(40).optional(),
    point: z
      .object({
        type: z.literal("Point").default("Point"),
        coordinates: z.tuple([
          z.number().min(-180).max(180),
          z.number().min(-90).max(90),
        ]),
      })
      .optional(),
  }),
  goods: z
    .array(
      z.object({
        description: z.string().min(1).max(300),
        quantity: z.number().int().positive(),
        weightKg: z.number().min(0).optional(),
        fragile: z.boolean().default(false),
        hazardous: z.boolean().default(false),
      }),
    )
    .min(1)
    .max(100),
  scheduledPickup: z.coerce.date().optional(),
  estimatedDelivery: z.coerce.date().optional(),
});
router.use(authenticate);
router.get(
  "/",
  allowRoles(
    "SUPER_ADMIN",
    "ADMIN",
    "DISPATCHER",
    "OWNER",
    "CUSTOMER",
    "AUDITOR",
  ),
  async (req, res, next) => {
    try {
      const q: any = { organizationId: org(req) };
      if (req.auth!.role === "CUSTOMER") q.customerId = req.auth!.userId;
      if (req.auth!.role === "OWNER") {
        const owner = await Owner.findOne({
          userId: req.auth!.userId,
          organizationId: org(req),
        });
        const vehicles = owner
          ? await Vehicle.find({
              ownerId: owner._id,
              organizationId: org(req),
            }).select("_id")
          : [];
        q.assignedVehicleId = { $in: vehicles.map((v) => v._id) };
      }
      const rows = await Shipment.find(q)
        .sort({ createdAt: -1 })
        .limit(Math.min(Number(req.query.limit) || 50, 100));
      res.json({ data: rows });
    } catch (e) {
      next(e);
    }
  },
);
router.post(
  "/",
  allowRoles("SUPER_ADMIN", "ADMIN", "DISPATCHER", "CUSTOMER"),
  async (req, res, next) => {
    try {
      const v = createSchema.parse(req.body);
      const code = `SHP-${randomBytes(6).toString("hex").toUpperCase()}`;
      const raw = randomBytes(32).toString("base64url");
      const row = await Shipment.create({
        ...v,
        organizationId: org(req),
        customerId: req.auth!.userId,
        trackingCode: code,
        publicTrackingHash: createHash("sha256").update(raw).digest("hex"),
        status: "BOOKED",
      });
      await audit(req, "shipment.created", "Shipment", String(row._id));
      await Notification.create({
        organizationId: org(req),
        userId: req.auth!.userId,
        type: "SHIPMENT_CREATED",
        title: "Shipment created",
        body: `${code} is booked`,
        resourceType: "Shipment",
        resourceId: String(row._id),
      });
      res.status(201).json({ data: row, publicTrackingToken: raw });
    } catch (e) {
      next(e);
    }
  },
);
router.post(
  "/:id/assign",
  allowRoles("SUPER_ADMIN", "ADMIN", "DISPATCHER"),
  async (req, res, next) => {
    try {
      const { driverId, vehicleId } = z
        .object({ driverId: z.string().min(1), vehicleId: z.string().min(1) })
        .parse(req.body);
      const shipment = await Shipment.findOne({
        _id: req.params.id,
        organizationId: org(req),
      });
      if (!shipment)
        throw new AppError(404, "SHIPMENT_NOT_FOUND", "Shipment not found");
      if (!["BOOKED", "FAILED_DELIVERY"].includes(shipment.status))
        throw new AppError(
          409,
          "INVALID_STATE",
          "Only booked or failed shipments can be assigned",
        );
      const driver = await Driver.findOne({
        _id: driverId,
        organizationId: org(req),
        status: "AVAILABLE",
      });
      const vehicle = await Vehicle.findOne({
        _id: vehicleId,
        organizationId: org(req),
        status: "AVAILABLE",
      });
      if (!driver || !vehicle)
        throw new AppError(
          409,
          "RESOURCE_UNAVAILABLE",
          "Driver and vehicle must belong to your organization and be available",
        );
      const active = ["ASSIGNED", "ACCEPTED", "IN_PROGRESS"];
      if (
        await Trip.exists({
          organizationId: org(req),
          $or: [{ driverId }, { vehicleId }],
          status: { $in: active },
        })
      )
        throw new AppError(
          409,
          "ASSIGNMENT_CONFLICT",
          "Driver or vehicle already has an active trip",
        );
      const trip = await Trip.create({
        organizationId: org(req),
        shipmentId: shipment._id,
        driverId,
        vehicleId,
        status: "ASSIGNED",
      });
      shipment.assignedDriverId = driver._id;
      shipment.assignedVehicleId = vehicle._id;
      shipment.currentTripId = trip._id;
      shipment.status = "ASSIGNED";
      await shipment.save();
      driver.status = "ASSIGNED";
      await driver.save();
      vehicle.status = "ASSIGNED";
      vehicle.currentDriverId = driver._id;
      await vehicle.save();
      await audit(req, "shipment.assigned", "Shipment", String(shipment._id), {
        driverId,
        vehicleId,
        tripId: String(trip._id),
      });
      res.json({ data: shipment, trip });
    } catch (e) {
      next(e);
    }
  },
);
router.patch(
  "/:id/status",
  allowRoles("SUPER_ADMIN", "ADMIN", "DISPATCHER", "DRIVER"),
  async (req, res, next) => {
    try {
      const { status } = z
        .object({
          status: z.enum([
            "DRAFT",
            "BOOKED",
            "ASSIGNED",
            "DRIVER_ACCEPTED",
            "ARRIVED_PICKUP",
            "LOADED",
            "IN_TRANSIT",
            "ARRIVED_DESTINATION",
            "DELIVERED",
            "COMPLETED",
            "CANCELLED",
            "FAILED_DELIVERY",
            "ON_HOLD",
          ]),
        })
        .parse(req.body);
      const row = await Shipment.findOne({
        _id: req.params.id,
        organizationId: org(req),
      });
      if (!row)
        throw new AppError(404, "SHIPMENT_NOT_FOUND", "Shipment not found");
      if (!canTransitionShipment(row.status, status))
        throw new AppError(
          409,
          "INVALID_TRANSITION",
          `Cannot move shipment from ${row.status} to ${status}`,
        );
      if (req.auth!.role === "DRIVER") {
        const driver = await Driver.findOne({
          userId: req.auth!.userId,
          organizationId: org(req),
        });
        const trip =
          row.currentTripId &&
          (await Trip.findOne({
            _id: row.currentTripId,
            organizationId: org(req),
            driverId: driver?._id,
          }));
        if (!trip)
          throw new AppError(
            403,
            "FORBIDDEN",
            "This trip is not assigned to you",
          );
      }
      if (
        status === "DELIVERED" &&
        !(await ProofOfDelivery.exists({
          shipmentId: row._id,
          organizationId: org(req),
        }))
      )
        throw new AppError(
          409,
          "POD_REQUIRED",
          "Proof of delivery is required before marking delivered",
        );
      const previous = row.status;
      row.status = status;
      await row.save();
      await audit(req, "shipment.status_changed", "Shipment", String(row._id), {
        previous,
        status,
      });
      res.json({ data: row });
    } catch (e) {
      next(e);
    }
  },
);
export default router;
