import { Router } from "express";
import { z } from "zod";
import {
  Driver,
  Trip,
  LocationHistory,
  Vehicle,
  Shipment,
  Owner,
} from "../../models/index.js";
import { authenticate, allowRoles } from "../../middleware/auth.js";
import { AppError } from "../../middleware/errors.js";
import { audit } from "../audit/audit.service.js";
const router = Router();
router.use(authenticate);
const schema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  speed: z.number().min(0).max(400).optional(),
  heading: z.number().min(0).max(360).optional(),
  accuracy: z.number().min(0).max(10000).optional(),
  timestamp: z.coerce.date(),
});
router.post("/location", allowRoles("DRIVER"), async (req, res, next) => {
  try {
    const v = schema.parse(req.body);
    if (
      v.timestamp.getTime() > Date.now() + 60000 ||
      v.timestamp.getTime() < Date.now() - 10 * 60000
    )
      throw new AppError(
        400,
        "INVALID_TIMESTAMP",
        "Location timestamp must be within the last ten minutes",
      );
    const driver = await Driver.findOne({
      userId: req.auth!.userId,
      organizationId: req.auth!.organizationId,
      status: "ON_TRIP",
    });
    if (!driver)
      throw new AppError(
        403,
        "NO_ACTIVE_TRIP",
        "No active driver assignment found",
      );
    const trip = await Trip.findOne({
      driverId: driver._id,
      organizationId: req.auth!.organizationId,
      status: "IN_PROGRESS",
    });
    if (!trip)
      throw new AppError(403, "NO_ACTIVE_TRIP", "No active trip found");
    const point = {
      type: "Point" as const,
      coordinates: [v.longitude, v.latitude],
    };
    const location = await LocationHistory.create({
      organizationId: req.auth!.organizationId,
      tripId: trip._id,
      driverId: driver._id,
      point,
      speed: v.speed,
      heading: v.heading,
      accuracy: v.accuracy,
      recordedAt: v.timestamp,
    });
    driver.currentLocation = point;
    await driver.save();
    await Vehicle.updateOne(
      { _id: trip.vehicleId, organizationId: req.auth!.organizationId },
      { $set: { currentLocation: point } },
    );
    req.app
      .get("io")
      ?.to(`org:${req.auth!.organizationId}:trip:${trip.id}`)
      .emit("location:update", {
        tripId: trip.id,
        latitude: v.latitude,
        longitude: v.longitude,
        speed: v.speed,
        heading: v.heading,
        recordedAt: v.timestamp,
      });
    res.status(202).json({ accepted: true, locationId: location.id });
  } catch (e) {
    next(e);
  }
});
router.get(
  "/trips/:tripId",
  allowRoles(
    "SUPER_ADMIN",
    "ADMIN",
    "DISPATCHER",
    "OWNER",
    "CUSTOMER",
    "AUDITOR",
    "DRIVER",
  ),
  async (req, res, next) => {
    try {
      const trip = await Trip.findOne({
        _id: req.params.tripId,
        organizationId: req.auth!.organizationId,
      });
      if (!trip) throw new AppError(404, "TRIP_NOT_FOUND", "Trip not found");
      if (
        req.auth!.role === "CUSTOMER" &&
        !(await Shipment.exists({
          _id: trip.shipmentId,
          customerId: req.auth!.userId,
          organizationId: req.auth!.organizationId,
        }))
      )
        throw new AppError(
          403,
          "FORBIDDEN",
          "Shipment is not visible to this customer",
        );
      if (
        req.auth!.role === "DRIVER" &&
        !(await Driver.exists({
          _id: trip.driverId,
          userId: req.auth!.userId,
          organizationId: req.auth!.organizationId,
        }))
      )
        throw new AppError(
          403,
          "FORBIDDEN",
          "Trip is not assigned to this driver",
        );
      if (req.auth!.role === "OWNER") {
        const owner = await Owner.findOne({
          userId: req.auth!.userId,
          organizationId: req.auth!.organizationId,
        });
        if (
          !owner ||
          !(await Vehicle.exists({
            _id: trip.vehicleId,
            ownerId: owner._id,
            organizationId: req.auth!.organizationId,
          }))
        )
          throw new AppError(
            403,
            "FORBIDDEN",
            "Trip is not visible to this owner",
          );
      }
      res.json({
        data: await LocationHistory.find({
          tripId: trip._id,
          organizationId: req.auth!.organizationId,
        })
          .sort({ recordedAt: -1 })
          .limit(500),
      });
    } catch (e) {
      next(e);
    }
  },
);
export default router;
