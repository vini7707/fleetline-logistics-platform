import mongoose, { Schema, model } from "mongoose";
const opts = { timestamps: true, versionKey: false } as const;
const geo = new Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (v: number[]) =>
          v.length === 2 &&
          v[0] >= -180 &&
          v[0] <= 180 &&
          v[1] >= -90 &&
          v[1] <= 90,
      },
    },
  },
  { _id: false, id: false },
);
const orgSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true },
    status: { type: String, enum: ["ACTIVE", "SUSPENDED"], default: "ACTIVE" },
  },
  opts,
);
const userSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: [
        "SUPER_ADMIN",
        "ADMIN",
        "DISPATCHER",
        "OWNER",
        "DRIVER",
        "CUSTOMER",
        "AUDITOR",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INVITED", "SUSPENDED"],
      default: "ACTIVE",
    },
    mfaEnabled: { type: Boolean, default: false },
  },
  opts,
);
userSchema.index({ organizationId: 1, email: 1 }, { unique: true });
const sessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    organizationId: { type: Schema.Types.ObjectId, required: true },
    refreshHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, expires: 0 },
    revokedAt: Date,
    userAgent: String,
    ip: String,
  },
  opts,
);
const driverSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "Owner" },
    licenseNumber: { type: String, required: true },
    licenseExpiry: { type: Date, required: true },
    emergencyContact: { name: String, phone: String },
    status: {
      type: String,
      enum: ["AVAILABLE", "ASSIGNED", "ON_TRIP", "OFF_DUTY", "SUSPENDED"],
      default: "AVAILABLE",
    },
    currentLocation: geo,
  },
  opts,
);
driverSchema.index({ currentLocation: "2dsphere" });
driverSchema.index({ organizationId: 1, licenseNumber: 1 }, { unique: true });
const ownerSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    phone: String,
  },
  opts,
);
const vehicleSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    ownerId: { type: Schema.Types.ObjectId, ref: "Owner", required: true },
    registrationNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    type: { type: String, required: true },
    make: String,
    model: String,
    capacityKg: { type: Number, min: 0 },
    status: {
      type: String,
      enum: ["AVAILABLE", "ASSIGNED", "ON_TRIP", "MAINTENANCE", "INACTIVE"],
      default: "AVAILABLE",
    },
    currentDriverId: { type: Schema.Types.ObjectId, ref: "Driver" },
    currentLocation: geo,
    documents: [
      { kind: String, number: String, expiresAt: Date, objectKey: String },
    ],
  },
  opts,
);
vehicleSchema.index(
  { organizationId: 1, registrationNumber: 1 },
  { unique: true },
);
vehicleSchema.index({ currentLocation: "2dsphere" });
const locationSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    tripId: {
      type: Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },
    driverId: { type: Schema.Types.ObjectId, ref: "Driver", required: true },
    point: { type: geo, required: true },
    speed: { type: Number, min: 0, max: 400 },
    heading: { type: Number, min: 0, max: 360 },
    accuracy: { type: Number, min: 0, max: 10000 },
    recordedAt: { type: Date, required: true },
    receivedAt: { type: Date, default: Date.now },
  },
  {
    ...opts,
    timeseries: {
      timeField: "recordedAt",
      metaField: "tripId",
      granularity: "minutes",
    },
  },
);
locationSchema.index({ point: "2dsphere" });
locationSchema.index({ tripId: 1, recordedAt: -1 });
const shipmentSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    trackingCode: { type: String, required: true, unique: true },
    pickup: {
      address: String,
      contactName: String,
      contactPhone: String,
      point: geo,
    },
    delivery: {
      address: String,
      contactName: String,
      contactPhone: String,
      point: geo,
    },
    goods: [
      {
        description: String,
        quantity: { type: Number, min: 1 },
        weightKg: { type: Number, min: 0 },
        fragile: Boolean,
        hazardous: Boolean,
      },
    ],
    scheduledPickup: Date,
    estimatedDelivery: Date,
    assignedDriverId: { type: Schema.Types.ObjectId, ref: "Driver" },
    assignedVehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle" },
    currentTripId: { type: Schema.Types.ObjectId, ref: "Trip" },
    status: {
      type: String,
      enum: [
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
      ],
      default: "DRAFT",
      index: true,
    },
    publicTrackingHash: String,
  },
  opts,
);
shipmentSchema.index({ organizationId: 1, createdAt: -1 });
const tripSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    shipmentId: {
      type: Schema.Types.ObjectId,
      ref: "Shipment",
      required: true,
    },
    driverId: { type: Schema.Types.ObjectId, ref: "Driver", required: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true },
    status: {
      type: String,
      enum: ["ASSIGNED", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "ASSIGNED",
      index: true,
    },
    startedAt: Date,
    endedAt: Date,
    startPoint: geo,
    endPoint: geo,
    distanceKm: { type: Number, min: 0 },
    route: [geo],
  },
  opts,
);
tripSchema.index({ driverId: 1, status: 1 });
tripSchema.index({ vehicleId: 1, status: 1 });
const auditSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    resourceType: String,
    resourceId: String,
    ip: String,
    userAgent: String,
    requestId: String,
    metadata: Schema.Types.Mixed,
  },
  { ...opts, versionKey: false },
);
auditSchema.index({ organizationId: 1, createdAt: -1 });
const notificationSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: String,
    title: String,
    body: String,
    readAt: Date,
    resourceType: String,
    resourceId: String,
  },
  opts,
);
const podSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    shipmentId: {
      type: Schema.Types.ObjectId,
      ref: "Shipment",
      required: true,
    },
    tripId: { type: Schema.Types.ObjectId, ref: "Trip", required: true },
    recipientName: { type: String, required: true },
    signatureObjectKey: String,
    photoObjectKeys: [String],
    otpVerified: Boolean,
    deliveredAt: Date,
    point: geo,
  },
  opts,
);
export const Organization = model("Organization", orgSchema);
export const User = model("User", userSchema);
export const Session = model("Session", sessionSchema);
export const Driver = model("Driver", driverSchema);
export const Owner = model("Owner", ownerSchema);
export const Vehicle = model("Vehicle", vehicleSchema);
export const Shipment = model("Shipment", shipmentSchema);
export const Trip = model("Trip", tripSchema);
export const LocationHistory = model("LocationHistory", locationSchema);
export const AuditLog = model("AuditLog", auditSchema);
export const Notification = model("Notification", notificationSchema);
export const ProofOfDelivery = model("ProofOfDelivery", podSchema);
