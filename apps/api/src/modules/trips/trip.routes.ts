import { Router } from "express";
import { Trip, Shipment, Driver, Vehicle, Owner } from "../../models/index.js";
import { authenticate, allowRoles } from "../../middleware/auth.js";
import { AppError } from "../../middleware/errors.js";
import { audit } from "../audit/audit.service.js";
const router = Router();
router.use(authenticate);
router.get(
  "/",
  allowRoles(
    "SUPER_ADMIN",
    "ADMIN",
    "DISPATCHER",
    "OWNER",
    "DRIVER",
    "CUSTOMER",
    "AUDITOR",
  ),
  async (req, res, next) => {
    try {
      const q: any = { organizationId: req.auth!.organizationId };
      if (req.auth!.role === "DRIVER") {
        const driver = await Driver.findOne({
          userId: req.auth!.userId,
          organizationId: req.auth!.organizationId,
        });
        q.driverId = driver?._id ?? null;
      }
      if (req.auth!.role === "OWNER") {
        const owner = await Owner.findOne({
          userId: req.auth!.userId,
          organizationId: req.auth!.organizationId,
        });
        const vehicles = owner
          ? await Vehicle.find({
              ownerId: owner._id,
              organizationId: req.auth!.organizationId,
            }).select("_id")
          : [];
        q.vehicleId = { $in: vehicles.map((v) => v._id) };
      }
      if (req.auth!.role === "CUSTOMER") {
        const shipments = await Shipment.find({
          organizationId: req.auth!.organizationId,
          customerId: req.auth!.userId,
        }).select("_id");
        q.shipmentId = { $in: shipments.map((s) => s._id) };
      }
      const trips = await Trip.find(q).sort({ createdAt: -1 }).limit(100);
      const shipmentRows = await Shipment.find({
        organizationId: req.auth!.organizationId,
        _id: { $in: trips.map((t) => t.shipmentId) },
      }).select("trackingCode status");
      const shipmentMap = new Map(shipmentRows.map((s) => [String(s._id), s]));
      res.json({
        data: trips.map((t) => ({
          ...t.toObject(),
          shipmentStatus: shipmentMap.get(String(t.shipmentId))?.status,
          trackingCode: shipmentMap.get(String(t.shipmentId))?.trackingCode,
        })),
      });
    } catch (e) {
      next(e);
    }
  },
);
router.post("/:id/accept", allowRoles("DRIVER"), async (req, res, next) => {
  try {
    const driver = await Driver.findOne({
      userId: req.auth!.userId,
      organizationId: req.auth!.organizationId,
    });
    const trip = await Trip.findOne({
      _id: req.params.id,
      organizationId: req.auth!.organizationId,
      driverId: driver?._id,
      status: "ASSIGNED",
    });
    if (!trip)
      throw new AppError(404, "TRIP_NOT_FOUND", "Assigned trip not found");
    trip.status = "ACCEPTED";
    await trip.save();
    await Shipment.updateOne(
      {
        _id: trip.shipmentId,
        organizationId: trip.organizationId,
        status: "ASSIGNED",
      },
      { $set: { status: "DRIVER_ACCEPTED" } },
    );
    await audit(req, "trip.accepted", "Trip", trip.id);
    res.json({ data: trip });
  } catch (e) {
    next(e);
  }
});
router.post(
  "/:id/start",
  allowRoles("DRIVER", "DISPATCHER", "ADMIN"),
  async (req, res, next) => {
    try {
      const trip = await Trip.findOne({
        _id: req.params.id,
        organizationId: req.auth!.organizationId,
        status: "ACCEPTED",
      });
      if (!trip)
        throw new AppError(409, "TRIP_NOT_READY", "Accepted trip not found");
      if (req.auth!.role === "DRIVER") {
        const driver = await Driver.findOne({
          _id: trip.driverId,
          userId: req.auth!.userId,
          organizationId: req.auth!.organizationId,
        });
        if (!driver)
          throw new AppError(
            403,
            "FORBIDDEN",
            "This trip is not assigned to you",
          );
      }
      trip.status = "IN_PROGRESS";
      trip.startedAt = new Date();
      await trip.save();
      await Driver.updateOne(
        { _id: trip.driverId, organizationId: trip.organizationId },
        { $set: { status: "ON_TRIP" } },
      );
      await Vehicle.updateOne(
        { _id: trip.vehicleId, organizationId: trip.organizationId },
        { $set: { status: "ON_TRIP" } },
      );
      await audit(req, "trip.started", "Trip", trip.id);
      res.json({ data: trip });
    } catch (e) {
      next(e);
    }
  },
);
export default router;
