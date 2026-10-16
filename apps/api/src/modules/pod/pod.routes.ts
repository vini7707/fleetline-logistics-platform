import { Router } from "express";
import { z } from "zod";
import {
  Shipment,
  Trip,
  ProofOfDelivery,
  Driver,
  Vehicle,
} from "../../models/index.js";
import { authenticate, allowRoles } from "../../middleware/auth.js";
import { AppError } from "../../middleware/errors.js";
import { audit } from "../audit/audit.service.js";
const router = Router();
router.use(authenticate);
router.post("/:shipmentId", allowRoles("DRIVER"), async (req, res, next) => {
  try {
    const v = z
      .object({
        recipientName: z.string().min(2).max(160),
        signatureObjectKey: z.string().optional(),
        photoObjectKeys: z.array(z.string()).max(5).default([]),
        otpVerified: z.boolean().default(false),
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
      })
      .parse(req.body);
    const shipment = await Shipment.findOne({
      _id: req.params.shipmentId,
      organizationId: req.auth!.organizationId,
      status: "ARRIVED_DESTINATION",
    });
    if (!shipment || !shipment.currentTripId)
      throw new AppError(
        409,
        "SHIPMENT_NOT_READY",
        "Shipment has not arrived at its destination",
      );
    const driver = await Driver.findOne({
      userId: req.auth!.userId,
      organizationId: req.auth!.organizationId,
    });
    const trip = await Trip.findOne({
      _id: shipment.currentTripId,
      driverId: driver?._id,
      organizationId: req.auth!.organizationId,
      status: "IN_PROGRESS",
    });
    if (!trip)
      throw new AppError(403, "FORBIDDEN", "This trip is not assigned to you");
    const pod = await ProofOfDelivery.create({
      organizationId: req.auth!.organizationId,
      shipmentId: shipment._id,
      tripId: trip._id,
      ...v,
      point: { type: "Point", coordinates: [v.longitude, v.latitude] },
      deliveredAt: new Date(),
    });
    shipment.status = "DELIVERED";
    await shipment.save();
    trip.status = "COMPLETED";
    trip.endedAt = new Date();
    await trip.save();
    await Driver.updateOne(
      { _id: trip.driverId, organizationId: trip.organizationId },
      { $set: { status: "AVAILABLE" } },
    );
    await Vehicle.updateOne(
      { _id: trip.vehicleId, organizationId: trip.organizationId },
      { $set: { status: "AVAILABLE" }, $unset: { currentDriverId: 1 } },
    );
    await audit(req, "delivery.completed", "Shipment", shipment.id);
    res.status(201).json({ data: pod });
  } catch (e) {
    next(e);
  }
});
export default router;
