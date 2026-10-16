export const shipmentTransitions: Record<string, readonly string[]> = {
  DRAFT: ["BOOKED", "CANCELLED"],
  BOOKED: ["ASSIGNED", "CANCELLED", "ON_HOLD"],
  ASSIGNED: ["DRIVER_ACCEPTED", "CANCELLED", "ON_HOLD"],
  DRIVER_ACCEPTED: ["ARRIVED_PICKUP", "CANCELLED", "ON_HOLD"],
  ARRIVED_PICKUP: ["LOADED", "FAILED_DELIVERY"],
  LOADED: ["IN_TRANSIT"],
  IN_TRANSIT: ["ARRIVED_DESTINATION", "ON_HOLD", "FAILED_DELIVERY"],
  ARRIVED_DESTINATION: ["DELIVERED", "FAILED_DELIVERY"],
  DELIVERED: ["COMPLETED"],
  ON_HOLD: ["BOOKED", "ASSIGNED", "CANCELLED"],
  FAILED_DELIVERY: ["BOOKED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};
export function canTransitionShipment(current: string, next: string): boolean {
  return shipmentTransitions[current]?.includes(next) ?? false;
}
