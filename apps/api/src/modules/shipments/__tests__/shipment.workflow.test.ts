import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { canTransitionShipment } from "../shipment.workflow.js";
describe("shipment state machine", () => {
  it("accepts the expected pickup-to-delivery path", () => {
    const path = [
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
    ];
    for (let i = 0; i < path.length - 1; i++)
      assert.equal(canTransitionShipment(path[i], path[i + 1]), true);
  });
  it("rejects skipped and terminal-state transitions", () => {
    assert.equal(canTransitionShipment("BOOKED", "IN_TRANSIT"), false);
    assert.equal(canTransitionShipment("COMPLETED", "BOOKED"), false);
    assert.equal(canTransitionShipment("CANCELLED", "ASSIGNED"), false);
  });
  it("allows defined hold and failed delivery recovery paths", () => {
    assert.equal(canTransitionShipment("IN_TRANSIT", "ON_HOLD"), true);
    assert.equal(canTransitionShipment("FAILED_DELIVERY", "BOOKED"), true);
  });
});
