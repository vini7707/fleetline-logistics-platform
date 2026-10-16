import { useEffect, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "./app/store";
import { signedIn, signedOut } from "./features/auth/sessionSlice";
import {
  type ShipmentRecord,
  type NotificationRecord,
  useAcceptTripMutation,
  useAssignShipmentMutation,
  useCreateShipmentMutation,
  useCurrentUserQuery,
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useRefreshSessionMutation,
  useShipmentsQuery,
  useStartTripMutation,
  useSendLocationMutation,
  useTrackingHistoryQuery,
  useTripsQuery,
  useDriversQuery,
  useVehiclesQuery,
  useOwnersQuery,
  useCreateVehicleMutation,
  useAdminUsersQuery,
  useCreateAdminUserMutation,
  useSetUserStatusMutation,
  useCreateDriverMutation,
  useReportSummaryQuery,
  useNotificationsQuery,
  useMarkNotificationReadMutation,
  useUpdateShipmentStatusMutation,
  useCreateProofOfDeliveryMutation,
  useCreateOwnerMutation,
  useAuditLogsQuery,
} from "./features/api/logisticsApi";
function Landing({
  onLogin,
  onRegister,
}: {
  onLogin: () => void;
  onRegister: () => void;
}) {
  return (
    <main className="marketing-site">
      <header className="marketing-header">
        <a className="marketing-brand" href="#home" aria-label="Fleetline home">
          <span className="brand-mark">F</span>
          <span>
            Fleetline<small>LOGISTICS</small>
          </span>
        </a>
        <nav className="marketing-nav" aria-label="Main navigation">
          <a href="#solutions">Solutions</a>
          <a href="#how-it-works">How it works</a>
          <a href="#about">About</a>
        </nav>
        <div className="marketing-actions">
          <button className="marketing-login" onClick={onLogin}>
            Log in
          </button>
          <button className="marketing-button header-cta" onClick={onRegister}>
            Get started <span>↗</span>
          </button>
        </div>
      </header>

      <section className="marketing-hero" id="home">
        <div className="hero-copy">
          <div className="hero-kicker">
            <span /> LOGISTICS, WITHOUT THE FRICTION
          </div>
          <h1>
            Move your business <span>forward.</span>
          </h1>
          <p className="hero-description">
            From the first pickup to the final mile, Fleetline brings your
            shipments, fleet, and delivery operations together in one dependable
            platform.
          </p>
          <div className="hero-actions">
            <button className="marketing-button" onClick={onRegister}>
              Get started <span>↗</span>
            </button>
            <a className="text-link" href="#solutions">
              Explore our solutions <span>↓</span>
            </a>
          </div>
          <div className="hero-proof">
            <div className="proof-avatars">
              <i>AM</i>
              <i>DS</i>
              <i>KJ</i>
            </div>
            <span>
              <strong>One clear view</strong>
              <br />
              for every delivery
            </span>
            <b className="proof-divider" />
            <span>
              <strong>Real-time updates</strong>
              <br />
              from dispatch to doorstep
            </span>
          </div>
        </div>
        <div
          className="hero-visual"
          aria-label="Freight moving by ship, plane, rail, and truck"
        >
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
          <div className="visual-tag tag-top">
            <span>↗</span>
            <div>
              <strong>On the move</strong>
              <small>Every mile, in view</small>
            </div>
          </div>
          <img
            src="/images/logistic-clean.png"
            alt="Ship, airplane, freight train, and truck moving goods around the world"
          />
          <div className="visual-tag tag-bottom">
            <span className="tag-check">✓</span>
            <div>
              <strong>Delivery complete</strong>
              <small>Shipment · FL-2048</small>
            </div>
          </div>
        </div>
        <a
          href="#solutions"
          className="hero-scroll"
          aria-label="Scroll to solutions"
        >
          SCROLL TO EXPLORE <span>↓</span>
        </a>
      </section>

      <section className="solutions-section" id="solutions">
        <div className="section-heading">
          <div>
            <p className="section-kicker">BUILT AROUND YOUR BUSINESS</p>
            <h2>
              One partner. <span>Every mile.</span>
            </h2>
          </div>
          <p>
            Flexible logistics tools that make complex operations feel simple.
          </p>
        </div>
        <div className="solution-grid">
          <article className="solution-card solution-blue">
            <span className="solution-icon">⌖</span>
            <p className="solution-number">01 / VISIBILITY</p>
            <h3>Know where every shipment stands.</h3>
            <p>
              Track progress from pickup through delivery, with timely updates
              and one source of truth for your team.
            </p>
            <a href="#how-it-works">
              Explore shipment tracking <span>↗</span>
            </a>
            <div className="card-art track-art">
              <i />
              <i />
              <i />
              <b>LIVE</b>
            </div>
          </article>
          <article className="solution-card solution-orange">
            <span className="solution-icon">↗</span>
            <p className="solution-number">02 / OPERATIONS</p>
            <h3>Keep your fleet moving.</h3>
            <p>
              Bring trips, drivers, vehicles, and dispatch into a connected
              operations workspace.
            </p>
            <a href="#how-it-works">
              Explore fleet operations <span>↗</span>
            </a>
            <div className="card-art route-art">
              <i>●</i>
              <span />
              <b>●</b>
            </div>
          </article>
          <article className="solution-card solution-green">
            <span className="solution-icon">✓</span>
            <p className="solution-number">03 / DELIVERY</p>
            <h3>Deliver with confidence.</h3>
            <p>
              Keep customers informed and capture delivery confirmation from the
              people on the ground.
            </p>
            <a href="#how-it-works">
              Explore delivery tools <span>↗</span>
            </a>
            <div className="card-art delivery-art">
              <div>
                <span>✓</span>
                <b>Delivered</b>
                <small>Proof of delivery saved</small>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="steps-section" id="how-it-works">
        <div className="steps-intro">
          <p className="section-kicker">A BETTER WAY TO MOVE</p>
          <h2>
            From first mile
            <br />
            to <span>final delivery.</span>
          </h2>
          <p>
            One connected workflow helps your team stay ahead of every handoff.
          </p>
          <button className="dark-button" onClick={onRegister}>
            Start moving with Fleetline <span>↗</span>
          </button>
        </div>
        <div className="steps-list">
          <article>
            <span>01</span>
            <div>
              <h3>Plan with a clear view</h3>
              <p>
                Create shipments and bring the right people and vehicles
                together.
              </p>
            </div>
            <b>↗</b>
          </article>
          <article>
            <span>02</span>
            <div>
              <h3>Keep every trip on track</h3>
              <p>
                Follow shipment status and share useful updates along the way.
              </p>
            </div>
            <b>↗</b>
          </article>
          <article>
            <span>03</span>
            <div>
              <h3>Close the loop</h3>
              <p>
                Record delivery confirmation and keep your operations history
                together.
              </p>
            </div>
            <b>✓</b>
          </article>
        </div>
      </section>

      <section className="marketing-cta" id="about">
        <div>
          <p className="section-kicker">READY WHEN YOU ARE</p>
          <h2>Let’s get your next delivery moving.</h2>
          <p>Bring your logistics operations into focus with Fleetline.</p>
        </div>
        <button className="marketing-button" onClick={onRegister}>
          Create your workspace <span>↗</span>
        </button>
        <div className="cta-decoration">F</div>
      </section>
      <footer className="marketing-footer">
        <a className="marketing-brand" href="#home">
          <span className="brand-mark">F</span>
          <span>
            Fleetline<small>LOGISTICS</small>
          </span>
        </a>
        <span>Moving business forward, one delivery at a time.</span>
        <small>© 2026 Fleetline Logistics</small>
      </footer>
    </main>
  );
}
function formatLabel(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function shortId(value?: string) {
  return value ? value.slice(-6).toUpperCase() : "—";
}
function apiMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "data" in error) {
    const data = (
      error as {
        data?: {
          error?: {
            message?: string;
          };
        };
      }
    ).data;
    if (data?.error?.message) return data.error.message;
  }
  return fallback;
}
function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`status status-${status.toLowerCase().replace(/_/g, "-")}`}
    >
      <i />
      {formatLabel(status)}
    </span>
  );
}
const shipmentNext: Record<string, string> = {
  ASSIGNED: "DRIVER_ACCEPTED",
  DRIVER_ACCEPTED: "ARRIVED_PICKUP",
  ARRIVED_PICKUP: "LOADED",
  LOADED: "IN_TRANSIT",
  IN_TRANSIT: "ARRIVED_DESTINATION",
  ARRIVED_DESTINATION: "DELIVERED",
  ON_HOLD: "BOOKED",
  FAILED_DELIVERY: "BOOKED",
  DELIVERED: "COMPLETED",
};
function ShipmentTable({
  rows,
  onAssign,
  canUpdateStatus = false,
}: {
  rows: ShipmentRecord[];
  onAssign?: (shipment: ShipmentRecord) => void;
  canUpdateStatus?: boolean;
}) {
  const [updateStatus, updateState] = useUpdateShipmentStatusMutation();
  if (!rows.length)
    return (
      <div className="empty-state">
        <span>▤</span>
        <strong>No shipments yet</strong>
        <p>Create a shipment to see it in your operations list.</p>
      </div>
    );
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>SHIPMENT</th>
            <th>ROUTE</th>
            <th>GOODS</th>
            <th>STATUS</th>
            <th>CREATED</th>
            {(onAssign || canUpdateStatus) && <th>ACTION</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((shipment) => (
            <tr key={shipment._id}>
              <td>
                <strong>{shipment.trackingCode}</strong>
                <small>
                  {shipment.pickup?.contactName || "Customer booking"}
                </small>
              </td>
              <td>
                <span className="route-cell">
                  {shipment.pickup?.address || "Pickup"}
                  <b>→</b>
                  {shipment.delivery?.address || "Delivery"}
                </span>
              </td>
              <td>
                {shipment.goods?.[0]?.description || "Goods"}
                {shipment.goods?.length > 1 && (
                  <small>+{shipment.goods.length - 1} more item types</small>
                )}
              </td>
              <td>
                <StatusPill status={shipment.status} />
              </td>
              <td>
                {shipment.createdAt
                  ? new Date(shipment.createdAt).toLocaleDateString()
                  : "—"}
              </td>
              {(onAssign || canUpdateStatus) && (
                <td className="shipment-actions">
                  {onAssign &&
                  ["BOOKED", "FAILED_DELIVERY"].includes(shipment.status) ? (
                    <button
                      className="small-action"
                      onClick={() => onAssign(shipment)}
                    >
                      Assign trip
                    </button>
                  ) : shipment.currentTripId ? (
                    <span className="muted-cell">
                      Trip {shortId(shipment.currentTripId)}
                    </span>
                  ) : null}
                  {canUpdateStatus && shipmentNext[shipment.status] && (
                    <button
                      className="small-action"
                      disabled={updateState.isLoading}
                      title={
                        shipment.status === "ARRIVED_DESTINATION"
                          ? "Delivery requires proof of delivery"
                          : undefined
                      }
                      onClick={() =>
                        void updateStatus({
                          id: shipment._id,
                          status: shipmentNext[shipment.status],
                        })
                      }
                    >
                      Next: {formatLabel(shipmentNext[shipment.status])}
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function ShipmentCreateDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (code: string) => void;
}) {
  const [createShipment, { isLoading, error }] = useCreateShipmentMutation();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const pickupAt = String(values.get("scheduledPickup") || "");
    const estimatedAt = String(values.get("estimatedDelivery") || "");
    try {
      const result = await createShipment({
        pickup: {
          address: String(values.get("pickupAddress")),
          contactName: String(values.get("pickupContact") || "") || undefined,
          contactPhone: String(values.get("pickupPhone") || "") || undefined,
        },
        delivery: {
          address: String(values.get("deliveryAddress")),
          contactName: String(values.get("deliveryContact") || "") || undefined,
          contactPhone: String(values.get("deliveryPhone") || "") || undefined,
        },
        goods: [
          {
            description: String(values.get("goods")),
            quantity: Number(values.get("quantity")),
            weightKg: values.get("weightKg")
              ? Number(values.get("weightKg"))
              : undefined,
          },
        ],
        scheduledPickup: pickupAt
          ? new Date(pickupAt).toISOString()
          : undefined,
        estimatedDelivery: estimatedAt
          ? new Date(estimatedAt).toISOString()
          : undefined,
      }).unwrap();
      onCreated(result.data.trackingCode);
    } catch {
      /* the API error is shown in the form */
    }
  }
  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="shipment-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shipment-dialog-title"
      >
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">NEW BOOKING</p>
            <h2 id="shipment-dialog-title">Create a shipment</h2>
            <p>Enter the pickup, delivery, and cargo details.</p>
          </div>
          <button
            type="button"
            className="dialog-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <form onSubmit={submit}>
          <div className="form-section">
            <h3>Route</h3>
            <div className="form-grid">
              <label>
                Pickup address
                <input
                  name="pickupAddress"
                  required
                  minLength={3}
                  placeholder="Street, city, postal code"
                />
              </label>
              <label>
                Delivery address
                <input
                  name="deliveryAddress"
                  required
                  minLength={3}
                  placeholder="Street, city, postal code"
                />
              </label>
              <label>
                Pickup contact
                <input name="pickupContact" placeholder="Contact name" />
              </label>
              <label>
                Delivery contact
                <input name="deliveryContact" placeholder="Contact name" />
              </label>
              <label>
                Pickup phone
                <input
                  name="pickupPhone"
                  type="tel"
                  placeholder="Phone number"
                />
              </label>
              <label>
                Delivery phone
                <input
                  name="deliveryPhone"
                  type="tel"
                  placeholder="Phone number"
                />
              </label>
            </div>
          </div>
          <div className="form-section">
            <h3>Cargo and schedule</h3>
            <div className="form-grid">
              <label>
                Goods description
                <input
                  name="goods"
                  required
                  minLength={1}
                  placeholder="e.g. Packaged food"
                />
              </label>
              <label>
                Quantity
                <input
                  name="quantity"
                  type="number"
                  required
                  min="1"
                  defaultValue="1"
                />
              </label>
              <label>
                Weight (kg)
                <input
                  name="weightKg"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="Optional"
                />
              </label>
              <label>
                Pickup time
                <input name="scheduledPickup" type="datetime-local" />
              </label>
              <label>
                Estimated delivery
                <input name="estimatedDelivery" type="datetime-local" />
              </label>
            </div>
          </div>
          {error && (
            <p className="form-error" role="alert">
              {apiMessage(
                error,
                "Could not create the shipment. Please check the details and try again.",
              )}
            </p>
          )}
          <div className="dialog-actions">
            <button type="button" className="plain-button" onClick={onClose}>
              Cancel
            </button>
            <button className="primary-button" disabled={isLoading}>
              {isLoading ? "Creating…" : "Create shipment"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
function AssignmentDialog({
  shipment,
  onClose,
}: {
  shipment: ShipmentRecord;
  onClose: () => void;
}) {
  const driversQuery = useDriversQuery();
  const vehiclesQuery = useVehiclesQuery();
  const [assign, { isLoading, error }] = useAssignShipmentMutation();
  const [driverId, setDriverId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const drivers =
    driversQuery.data?.data.filter((driver) => driver.status === "AVAILABLE") ??
    [];
  const vehicles =
    vehiclesQuery.data?.data.filter(
      (vehicle) => vehicle.status === "AVAILABLE",
    ) ?? [];
  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      await assign({ id: shipment._id, driverId, vehicleId }).unwrap();
      onClose();
    } catch {
      /* the API error is shown in the dialog */
    }
  }
  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="shipment-dialog assignment-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-dialog-title"
      >
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">{shipment.trackingCode}</p>
            <h2 id="assign-dialog-title">Assign a trip</h2>
            <p>
              Choose an available driver and vehicle. This creates the trip.
            </p>
          </div>
          <button
            type="button"
            className="dialog-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <form onSubmit={submit}>
          <div className="form-grid">
            <label>
              Available driver
              <select
                required
                value={driverId}
                onChange={(event) => setDriverId(event.target.value)}
              >
                <option value="">Select a driver</option>
                {drivers.map((driver) => (
                  <option key={driver._id} value={driver._id}>
                    Driver · {shortId(driver._id)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Available vehicle
              <select
                required
                value={vehicleId}
                onChange={(event) => setVehicleId(event.target.value)}
              >
                <option value="">Select a vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.registrationNumber} · {vehicle.type}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {(driversQuery.isLoading || vehiclesQuery.isLoading) && (
            <p className="muted-cell">Loading fleet resources…</p>
          )}
          {!driversQuery.isLoading &&
            !vehiclesQuery.isLoading &&
            (!drivers.length || !vehicles.length) && (
              <p className="inline-notice">
                {!drivers.length
                  ? "No available drivers found."
                  : "No available vehicles found."}{" "}
                Add fleet resources before assigning this shipment.
              </p>
            )}
          {error && (
            <p className="form-error" role="alert">
              {apiMessage(
                error,
                "Could not assign this shipment. Check resource availability.",
              )}
            </p>
          )}
          <div className="dialog-actions">
            <button type="button" className="plain-button" onClick={onClose}>
              Cancel
            </button>
            <button
              className="primary-button"
              disabled={isLoading || !drivers.length || !vehicles.length}
            >
              {isLoading ? "Assigning…" : "Create trip"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
function TripsView() {
  const tripsQuery = useTripsQuery();
  const shipmentsQuery = useShipmentsQuery();
  const [acceptTrip, acceptState] = useAcceptTripMutation();
  const [startTrip, startState] = useStartTripMutation();
  const [updateShipmentStatus] = useUpdateShipmentStatusMutation();
  const [completeDelivery, deliveryState] = useCreateProofOfDeliveryMutation();
  const [sendLocation, locationState] = useSendLocationMutation();
  const userQuery = useCurrentUserQuery();
  const role = userQuery.data?.user.role;
  const [actionError, setActionError] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [recipientNames, setRecipientNames] = useState<Record<string, string>>(
    {},
  );
  const trips = tripsQuery.data?.data ?? [];
  async function runAction(action: "accept" | "start", id: string) {
    setActionError("");
    try {
      if (action === "accept") await acceptTrip(id).unwrap();
      else await startTrip(id).unwrap();
    } catch (error) {
      setActionError(apiMessage(error, "Could not update this trip."));
    }
  }
  function shareCurrentLocation() {
    setActionError("");
    setLocationMessage("");
    if (!navigator.geolocation) {
      setActionError("Location sharing is not available in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy, speed, heading } =
          position.coords;
        void sendLocation({
          latitude,
          longitude,
          accuracy,
          speed: speed ?? undefined,
          heading: heading ?? undefined,
          timestamp: new Date(position.timestamp).toISOString(),
        })
          .unwrap()
          .then(() =>
            setLocationMessage(
              "Your current location was shared with dispatch.",
            ),
          )
          .catch((error) =>
            setActionError(apiMessage(error, "Could not send your location.")),
          );
      },
      () =>
        setActionError(
          "Location permission was denied or your position could not be determined.",
        ),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }
  function finishDelivery(shipmentId: string) {
    const recipientName = recipientNames[shipmentId]?.trim();
    if (!recipientName) {
      setActionError("Enter the recipient name before recording delivery.");
      return;
    }
    if (!navigator.geolocation) {
      setActionError("Location is required to record proof of delivery.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        void completeDelivery({
          shipmentId,
          recipientName,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
          .unwrap()
          .then(() =>
            setLocationMessage(
              "Delivery confirmed. The shipment and trip are complete.",
            ),
          )
          .catch((error) =>
            setActionError(
              apiMessage(error, "Could not record proof of delivery."),
            ),
          );
      },
      () =>
        setActionError("Allow location access to record proof of delivery."),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }
  return (
    <section className="feature-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">FLEET OPERATIONS</p>
          <h1>Trips</h1>
          <p className="subheading">
            Review assignments and move accepted trips into progress.
          </p>
        </div>
      </div>
      {actionError && (
        <p className="form-error" role="alert">
          {actionError}
        </p>
      )}
      {locationMessage && (
        <p className="location-success" role="status">
          {locationMessage}
        </p>
      )}
      {tripsQuery.isLoading ? (
        <div className="inline-notice">Loading trips…</div>
      ) : tripsQuery.error ? (
        <div className="form-error">
          {apiMessage(
            tripsQuery.error,
            "Could not load trips. Sign in again and retry.",
          )}
        </div>
      ) : !trips.length ? (
        <div className="empty-state">
          <span>↗</span>
          <strong>No trips created yet</strong>
          <p>
            Assign a booked shipment to an available driver and vehicle to
            create its trip.
          </p>
        </div>
      ) : (
        <div className="trip-grid">
          {trips.map((trip) => {
            const linkedShipment = shipmentsQuery.data?.data.find(
              (shipment) => shipment._id === trip.shipmentId,
            );
            const currentShipmentStatus =
              trip.shipmentStatus || linkedShipment?.status;
            return (
              <article className="trip-card" key={trip._id}>
                <div className="trip-card-top">
                  <span className="trip-icon">↗</span>
                  <StatusPill status={trip.status} />
                </div>
                <p className="eyebrow">TRIP {shortId(trip._id)}</p>
                <h2>
                  {trip.trackingCode ||
                    linkedShipment?.trackingCode ||
                    `Shipment ${shortId(trip.shipmentId)}`}
                </h2>
                <div className="trip-route">
                  <span>
                    Shipment status
                    <b>
                      <StatusPill status={currentShipmentStatus || "BOOKED"} />
                    </b>
                  </span>
                  <span>
                    Vehicle <b>{shortId(trip.vehicleId)}</b>
                  </span>
                </div>
                {trip.startedAt && (
                  <p className="trip-started">
                    Started {new Date(trip.startedAt).toLocaleString()}
                  </p>
                )}
                {trip.status === "ASSIGNED" && role === "DRIVER" && (
                  <button
                    className="primary-button trip-action"
                    disabled={acceptState.isLoading}
                    onClick={() => void runAction("accept", trip._id)}
                  >
                    Accept trip
                  </button>
                )}
                {trip.status === "ASSIGNED" && role !== "DRIVER" && (
                  <p className="trip-hint">
                    Waiting for the assigned driver to accept.
                  </p>
                )}
                {trip.status === "ACCEPTED" &&
                  ["ADMIN", "SUPER_ADMIN", "DISPATCHER", "DRIVER"].includes(
                    role || "",
                  ) && (
                    <button
                      className="primary-button trip-action"
                      disabled={startState.isLoading}
                      onClick={() => void runAction("start", trip._id)}
                    >
                      Start trip
                    </button>
                  )}
                {trip.status === "IN_PROGRESS" && (
                  <>
                    <p className="trip-hint live-hint">
                      <i /> Live tracking is active
                    </p>
                    {role === "DRIVER" && (
                      <button
                        className="small-action location-action"
                        disabled={locationState.isLoading}
                        onClick={shareCurrentLocation}
                      >
                        {locationState.isLoading
                          ? "Sharing…"
                          : "Share my current location"}
                      </button>
                    )}
                    {role === "DRIVER" &&
                      currentShipmentStatus &&
                      shipmentNext[currentShipmentStatus] &&
                      currentShipmentStatus !== "ARRIVED_DESTINATION" && (
                        <button
                          className="small-action location-action"
                          onClick={() => {
                            setActionError("");
                            void updateShipmentStatus({
                              id: trip.shipmentId,
                              status: shipmentNext[currentShipmentStatus],
                            })
                              .unwrap()
                              .catch((error) =>
                                setActionError(
                                  apiMessage(
                                    error,
                                    "Could not update shipment status.",
                                  ),
                                ),
                              );
                          }}
                        >
                          Advance shipment to{" "}
                          {formatLabel(shipmentNext[currentShipmentStatus])}
                        </button>
                      )}
                    {role === "DRIVER" &&
                      currentShipmentStatus === "ARRIVED_DESTINATION" && (
                        <div className="pod-form">
                          <label>
                            Recipient name
                            <input
                              value={recipientNames[trip.shipmentId] || ""}
                              onChange={(event) =>
                                setRecipientNames((state) => ({
                                  ...state,
                                  [trip.shipmentId]: event.target.value,
                                }))
                              }
                              placeholder="Who received this delivery?"
                            />
                          </label>
                          <button
                            className="primary-button"
                            disabled={deliveryState.isLoading}
                            onClick={() => finishDelivery(trip.shipmentId)}
                          >
                            {deliveryState.isLoading
                              ? "Recording…"
                              : "Record proof of delivery"}
                          </button>
                        </div>
                      )}
                  </>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
function TrackingView() {
  const tripsQuery = useTripsQuery();
  const activeTrips =
    tripsQuery.data?.data.filter((trip) => trip.status === "IN_PROGRESS") ?? [];
  const [selectedTripId, setSelectedTripId] = useState("");
  const selectedTrip =
    activeTrips.find((trip) => trip._id === selectedTripId) ?? activeTrips[0];
  const historyQuery = useTrackingHistoryQuery(selectedTrip?._id ?? "", {
    skip: !selectedTrip,
    pollingInterval: 10000,
  });
  const history = historyQuery.data?.data ?? [];
  const points = [...history].reverse().map((entry) => entry.point.coordinates);
  const longitudes = points.map((point) => point[0]);
  const latitudes = points.map((point) => point[1]);
  const minLon = Math.min(...longitudes),
    maxLon = Math.max(...longitudes),
    minLat = Math.min(...latitudes),
    maxLat = Math.max(...latitudes);
  const plotted = points
    .map(
      ([longitude, latitude]) =>
        `${40 + ((longitude - minLon) / (maxLon - minLon || 1)) * 920},${560 - ((latitude - minLat) / (maxLat - minLat || 1)) * 520}`,
    )
    .join(" ");
  const latest = history[0];
  return (
    <section className="feature-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">FLEET VISIBILITY</p>
          <h1>Live tracking</h1>
          <p className="subheading">
            Recent driver GPS updates refresh automatically every 10 seconds.
          </p>
        </div>
        {activeTrips.length > 0 && (
          <label className="trip-selector">
            Active trip
            <select
              value={selectedTrip?._id ?? ""}
              onChange={(event) => setSelectedTripId(event.target.value)}
            >
              {activeTrips.map((trip) => (
                <option key={trip._id} value={trip._id}>
                  Trip {shortId(trip._id)} · Shipment {shortId(trip.shipmentId)}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {tripsQuery.isLoading ? (
        <div className="inline-notice">Loading active trips…</div>
      ) : !activeTrips.length ? (
        <div className="empty-state">
          <span>⌖</span>
          <strong>No trips are moving right now</strong>
          <p>
            When a driver starts an assigned trip, its GPS updates will appear
            here.
          </p>
        </div>
      ) : historyQuery.isLoading ? (
        <div className="inline-notice">Loading location history…</div>
      ) : historyQuery.error ? (
        <div className="form-error">
          {apiMessage(historyQuery.error, "Could not load location history.")}
        </div>
      ) : !history.length ? (
        <div className="empty-state">
          <span>⌖</span>
          <strong>Waiting for the first GPS update</strong>
          <p>
            Trip {shortId(selectedTrip?._id)} is in progress. Its latest
            location will appear here when the driver sends it.
          </p>
        </div>
      ) : (
        <>
          <div className="tracking-summary">
            <div>
              <span className="live-dot" /> LIVE LOCATION
            </div>
            <strong>Shipment {shortId(selectedTrip?.shipmentId)}</strong>
            <span>
              Last update{" "}
              {latest?.recordedAt
                ? new Date(latest.recordedAt).toLocaleString()
                : "—"}
            </span>
          </div>
          <div className="tracking-layout">
            <section className="tracking-map panel">
              <div className="panel-heading">
                <div>
                  <h2>Trip route</h2>
                  <p>GPS points received for this trip</p>
                </div>
                <span className="tracking-point-count">
                  {history.length} points
                </span>
              </div>
              <div className="tracking-canvas">
                <div className="tracking-grid" />
                <svg
                  viewBox="0 0 1000 600"
                  role="img"
                  aria-label="Plot of recent GPS locations"
                >
                  {points.length > 1 && (
                    <polyline
                      points={plotted}
                      fill="none"
                      stroke="#42b6ca"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                  {points.map((point, index) => {
                    const [longitude, latitude] = point;
                    const x =
                      40 +
                      ((longitude - minLon) / (maxLon - minLon || 1)) * 920;
                    const y =
                      560 -
                      ((latitude - minLat) / (maxLat - minLat || 1)) * 520;
                    return (
                      <circle
                        key={`${index}-${longitude}-${latitude}`}
                        cx={x}
                        cy={y}
                        r={index === points.length - 1 ? 18 : 9}
                        fill={
                          index === points.length - 1 ? "#ef7748" : "#42b6ca"
                        }
                        stroke="white"
                        strokeWidth="6"
                      />
                    );
                  })}
                </svg>
                <span className="map-start-label">START</span>
                <span className="map-end-label">LATEST</span>
              </div>
            </section>
            <aside className="panel latest-location">
              <p className="eyebrow">LATEST LOCATION</p>
              <h2>GPS coordinates</h2>
              <div>
                <span>Latitude</span>
                <strong>{latest?.point.coordinates[1].toFixed(5)}</strong>
              </div>
              <div>
                <span>Longitude</span>
                <strong>{latest?.point.coordinates[0].toFixed(5)}</strong>
              </div>
              {latest?.speed !== undefined && (
                <div>
                  <span>Speed</span>
                  <strong>{latest.speed} km/h</strong>
                </div>
              )}
              {latest?.heading !== undefined && (
                <div>
                  <span>Heading</span>
                  <strong>{latest.heading}°</strong>
                </div>
              )}
              <p className="tracking-note">
                This view plots the GPS history returned by the tracking API. It
                does not use a third-party map provider.
              </p>
            </aside>
          </div>
        </>
      )}
    </section>
  );
}
function FleetView({
  section,
  role,
}: {
  section: "Drivers" | "Vehicles";
  role: string;
}) {
  const drivers = useDriversQuery(undefined, { skip: section !== "Drivers" });
  const vehicles = useVehiclesQuery(undefined, {
    skip: section !== "Vehicles",
  });
  const owners = useOwnersQuery(undefined, { skip: section !== "Vehicles" });
  const [createUser, userState] = useCreateAdminUserMutation();
  const [createDriver, driverState] = useCreateDriverMutation();
  const [createVehicle, vehicleState] = useCreateVehicleMutation();
  const [message, setMessage] = useState("");
  const canManageDrivers = ["ADMIN", "SUPER_ADMIN"].includes(role);
  async function submitDriver(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const user = await createUser({
        name: String(form.get("name")),
        email: String(form.get("email")),
        password: String(form.get("password")),
        role: "DRIVER",
      }).unwrap();
      await createDriver({
        userId: user.data.id || user.data._id || "",
        licenseNumber: String(form.get("license")),
        licenseExpiry: new Date(String(form.get("expiry"))).toISOString(),
      }).unwrap();
      setMessage("Driver account and fleet profile created.");
      event.currentTarget.reset();
    } catch (error) {
      setMessage(
        apiMessage(
          error,
          "Could not create driver. If the account was created, retry with a different email and contact an administrator to link the profile.",
        ),
      );
    }
  }
  async function submitVehicle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await createVehicle({
        ownerId: String(form.get("ownerId")),
        registrationNumber: String(form.get("registrationNumber")),
        type: String(form.get("type")),
        make: String(form.get("make") || "") || undefined,
        model: String(form.get("model") || "") || undefined,
        capacityKg: form.get("capacityKg")
          ? Number(form.get("capacityKg"))
          : undefined,
      }).unwrap();
      setMessage("Vehicle added to the fleet.");
      event.currentTarget.reset();
    } catch (error) {
      setMessage(apiMessage(error, "Could not add vehicle."));
    }
  }
  const fleetRows =
    section === "Drivers"
      ? (drivers.data?.data ?? [])
      : (vehicles.data?.data ?? []);
  return (
    <section className="feature-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">FLEET OPERATIONS</p>
          <h1>{section}</h1>
          <p className="subheading">
            {section === "Drivers"
              ? "Manage driver profiles and availability."
              : "Register vehicles and review fleet availability."}
          </p>
        </div>
      </div>
      {message && (
        <div className="inline-notice" role="status">
          {message}
        </div>
      )}
      {section === "Drivers" && canManageDrivers && (
        <section className="panel admin-form-panel">
          <div className="panel-heading">
            <div>
              <h2>Add a driver</h2>
              <p>Creates a driver login and its license profile.</p>
            </div>
          </div>
          <form
            className="form-grid inline-create-form"
            onSubmit={(event) => void submitDriver(event)}
          >
            <label>
              Full name
              <input name="name" required minLength={2} />
            </label>
            <label>
              Email
              <input name="email" required type="email" />
            </label>
            <label>
              Temporary password
              <input name="password" required type="password" minLength={12} />
            </label>
            <label>
              License number
              <input name="license" required minLength={3} />
            </label>
            <label>
              License expiry
              <input name="expiry" required type="date" />
            </label>
            <button
              className="primary-button"
              disabled={userState.isLoading || driverState.isLoading}
            >
              {userState.isLoading || driverState.isLoading
                ? "Saving…"
                : "Add driver"}
            </button>
          </form>
        </section>
      )}
      {section === "Vehicles" && (
        <section className="panel admin-form-panel">
          <div className="panel-heading">
            <div>
              <h2>Add a vehicle</h2>
              <p>
                Choose an existing fleet owner and enter the vehicle details.
              </p>
            </div>
          </div>
          <form
            className="form-grid inline-create-form"
            onSubmit={(event) => void submitVehicle(event)}
          >
            <label>
              Fleet owner
              <select name="ownerId" required defaultValue="">
                <option value="" disabled>
                  Select owner
                </option>
                {(owners.data?.data ?? []).map((owner) => (
                  <option key={owner._id} value={owner._id}>
                    {owner.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Registration number
              <input name="registrationNumber" required minLength={3} />
            </label>
            <label>
              Vehicle type
              <input name="type" required placeholder="Truck, van…" />
            </label>
            <label>
              Make
              <input name="make" />
            </label>
            <label>
              Model
              <input name="model" />
            </label>
            <label>
              Capacity (kg)
              <input name="capacityKg" type="number" min="0" />
            </label>
            <button
              className="primary-button"
              disabled={vehicleState.isLoading || !owners.data?.data.length}
            >
              {vehicleState.isLoading ? "Saving…" : "Add vehicle"}
            </button>
          </form>
          {owners.isLoading && <p className="muted-cell">Loading owners…</p>}
          {!owners.isLoading && !owners.data?.data.length && (
            <p className="inline-notice">
              No fleet owners exist yet. An administrator must add an owner
              before vehicles can be registered.
            </p>
          )}
        </section>
      )}
      <section className="panel admin-form-panel">
        <div className="panel-heading">
          <div>
            <h2>{section} directory</h2>
            <p>{fleetRows.length} records</p>
          </div>
        </div>
        {(section === "Drivers" ? drivers.isLoading : vehicles.isLoading) ? (
          <div className="inline-notice">Loading {section.toLowerCase()}…</div>
        ) : (section === "Drivers" ? drivers.error : vehicles.error) ? (
          <div className="form-error">
            {apiMessage(
              section === "Drivers" ? drivers.error : vehicles.error,
              `Could not load ${section.toLowerCase()}.`,
            )}
          </div>
        ) : !fleetRows.length ? (
          <div className="empty-state">
            <span>{section === "Drivers" ? "♙" : "▰"}</span>
            <strong>No {section.toLowerCase()} registered</strong>
            <p>Add fleet resources to make dispatch assignments available.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  {section === "Drivers" ? (
                    <>
                      <th>DRIVER PROFILE</th>
                      <th>LICENSE</th>
                      <th>STATUS</th>
                    </>
                  ) : (
                    <>
                      <th>REGISTRATION</th>
                      <th>TYPE</th>
                      <th>STATUS</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {section === "Drivers"
                  ? (drivers.data?.data ?? []).map((d) => (
                      <tr key={d._id}>
                        <td>
                          <strong>Driver {shortId(d.userId)}</strong>
                        </td>
                        <td>
                          {(
                            d as typeof d & {
                              licenseNumber?: string;
                            }
                          ).licenseNumber || "—"}
                        </td>
                        <td>
                          <StatusPill status={d.status} />
                        </td>
                      </tr>
                    ))
                  : (vehicles.data?.data ?? []).map((v) => (
                      <tr key={v._id}>
                        <td>
                          <strong>{v.registrationNumber}</strong>
                        </td>
                        <td>{v.type}</td>
                        <td>
                          <StatusPill status={v.status} />
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
function CustomersView() {
  const users = useAdminUsersQuery();
  const [createUser, createState] = useCreateAdminUserMutation();
  const [setStatus] = useSetUserStatusMutation();
  const [message, setMessage] = useState("");
  const customers = users.data?.data.filter((u) => u.role === "CUSTOMER") ?? [];
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await createUser({
        name: String(form.get("name")),
        email: String(form.get("email")),
        password: String(form.get("password")),
        role: "CUSTOMER",
      }).unwrap();
      setMessage("Customer account created.");
      event.currentTarget.reset();
    } catch (error) {
      setMessage(apiMessage(error, "Could not create customer account."));
    }
  }
  return (
    <section className="feature-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">CUSTOMER ACCOUNTS</p>
          <h1>Customers</h1>
          <p className="subheading">
            Create customer logins and manage workspace access.
          </p>
        </div>
      </div>
      {message && <div className="inline-notice">{message}</div>}
      <section className="panel admin-form-panel">
        <div className="panel-heading">
          <div>
            <h2>Add a customer</h2>
            <p>Customers can create shipments and view their own records.</p>
          </div>
        </div>
        <form
          className="form-grid inline-create-form"
          onSubmit={(e) => void submit(e)}
        >
          <label>
            Name
            <input name="name" required minLength={2} />
          </label>
          <label>
            Email
            <input name="email" type="email" required />
          </label>
          <label>
            Temporary password
            <input name="password" type="password" minLength={12} required />
          </label>
          <button className="primary-button" disabled={createState.isLoading}>
            {createState.isLoading ? "Saving…" : "Create customer"}
          </button>
        </form>
      </section>
      <section className="panel admin-form-panel">
        <div className="panel-heading">
          <div>
            <h2>Customer directory</h2>
            <p>{customers.length} accounts</p>
          </div>
        </div>
        {users.isLoading ? (
          <div className="inline-notice">Loading customers…</div>
        ) : users.error ? (
          <div className="form-error">
            {apiMessage(
              users.error,
              "Customer administration requires an admin account.",
            )}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>STATUS</th>
                  <th>ACCESS</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((u) => (
                  <tr key={u._id || u.id}>
                    <td>
                      <strong>{u.name}</strong>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <StatusPill status={u.status} />
                    </td>
                    <td>
                      <button
                        className="small-action"
                        onClick={() =>
                          void setStatus({
                            id: u._id || u.id || "",
                            status:
                              u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE",
                          })
                        }
                      >
                        {u.status === "ACTIVE" ? "Suspend" : "Reactivate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!customers.length && (
              <div className="empty-state">
                <strong>No customer accounts yet</strong>
                <p>Create a customer login above.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </section>
  );
}
function ReportsView() {
  const report = useReportSummaryQuery();
  const summary = report.data?.data;
  return (
    <section className="feature-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">WORKSPACE ANALYTICS</p>
          <h1>Reports</h1>
          <p className="subheading">
            A current summary of shipment status and fleet availability.
          </p>
        </div>
      </div>
      {report.isLoading ? (
        <div className="inline-notice">Loading report…</div>
      ) : report.error ? (
        <div className="form-error">
          {apiMessage(report.error, "Reports are available to administrators.")}
        </div>
      ) : (
        summary && (
          <>
            <div className="metric-grid">
              {[
                { label: "Active trips", value: summary.activeTrips },
                { label: "Available drivers", value: summary.availableDrivers },
                {
                  label: "Available vehicles",
                  value: summary.availableVehicles,
                },
                {
                  label: "Shipment statuses",
                  value: summary.shipmentsByStatus.reduce(
                    (n, s) => n + s.count,
                    0,
                  ),
                },
              ].map((item, i) => (
                <article className="metric-card" key={item.label}>
                  <div className="metric-top">
                    <span>{item.label}</span>
                  </div>
                  <strong>{item.value}</strong>
                  <small>
                    {i === 3
                      ? "Total shipment records"
                      : "Current availability"}
                  </small>
                </article>
              ))}
            </div>
            <section className="panel admin-form-panel">
              <div className="panel-heading">
                <div>
                  <h2>Shipments by status</h2>
                  <p>Current totals from the reporting API.</p>
                </div>
              </div>
              {summary.shipmentsByStatus.length ? (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>STATUS</th>
                        <th>SHIPMENTS</th>
                        <th>SHARE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.shipmentsByStatus.map((item) => (
                        <tr key={item._id}>
                          <td>
                            <StatusPill status={item._id} />
                          </td>
                          <td>
                            <strong>{item.count}</strong>
                          </td>
                          <td>
                            {Math.round(
                              (item.count /
                                Math.max(
                                  1,
                                  summary.shipmentsByStatus.reduce(
                                    (n, s) => n + s.count,
                                    0,
                                  ),
                                )) *
                                100,
                            )}
                            %
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <strong>No report data yet</strong>
                  <p>Create shipments to populate this report.</p>
                </div>
              )}
            </section>
          </>
        )
      )}
    </section>
  );
}
function NotificationsView() {
  const query = useNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const rows = (query.data?.data ?? []) as NotificationRecord[];
  return (
    <section className="feature-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">WORKSPACE UPDATES</p>
          <h1>Notifications</h1>
          <p className="subheading">
            Shipment and account events addressed to your login.
          </p>
        </div>
      </div>
      {query.isLoading ? (
        <div className="inline-notice">Loading notifications…</div>
      ) : query.error ? (
        <div className="form-error">
          {apiMessage(query.error, "Could not load notifications.")}
        </div>
      ) : !rows.length ? (
        <div className="empty-state">
          <span>♧</span>
          <strong>You’re all caught up</strong>
          <p>New shipment and operations updates will appear here.</p>
        </div>
      ) : (
        <div className="notification-list">
          {rows.map((n) => (
            <article
              key={n._id}
              className={`notification-card ${n.readAt ? "read" : "unread"}`}
            >
              <span className="notification-mark">{n.readAt ? "✓" : "•"}</span>
              <div>
                <strong>{n.title}</strong>
                <p>{n.body}</p>
                <small>
                  {n.createdAt
                    ? new Date(n.createdAt).toLocaleString()
                    : formatLabel(n.type)}
                </small>
              </div>
              {!n.readAt && (
                <button
                  className="small-action"
                  onClick={() => void markRead(n._id)}
                >
                  Mark read
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
function OwnersView({ canCreate }: { canCreate: boolean }) {
  const query = useOwnersQuery();
  const [createOwner, state] = useCreateOwnerMutation();
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await createOwner({
        name: String(form.get("name")),
        phone: String(form.get("phone") || "") || undefined,
      }).unwrap();
      setMessage(
        "Fleet owner added. You can now register vehicles for this owner.",
      );
      event.currentTarget.reset();
    } catch (error) {
      setMessage(apiMessage(error, "Could not create fleet owner."));
    }
  }
  return (
    <section className="feature-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">FLEET PARTNERS</p>
          <h1>Owners</h1>
          <p className="subheading">
            Manage the fleet owners associated with your vehicles.
          </p>
        </div>
      </div>
      {message && <div className="inline-notice">{message}</div>}
      {canCreate && (
        <section className="panel admin-form-panel">
          <div className="panel-heading">
            <div>
              <h2>Add fleet owner</h2>
              <p>New owners become selectable when you add vehicles.</p>
            </div>
          </div>
          <form
            className="form-grid inline-create-form"
            onSubmit={(e) => void submit(e)}
          >
            <label>
              Owner or company name
              <input name="name" required minLength={2} />
            </label>
            <label>
              Phone
              <input name="phone" type="tel" />
            </label>
            <button className="primary-button" disabled={state.isLoading}>
              {state.isLoading ? "Saving…" : "Add owner"}
            </button>
          </form>
        </section>
      )}
      <section className="panel admin-form-panel">
        <div className="panel-heading">
          <div>
            <h2>Owner directory</h2>
            <p>{query.data?.data.length ?? 0} fleet owners</p>
          </div>
        </div>
        {query.isLoading ? (
          <div className="inline-notice">Loading owners…</div>
        ) : query.error ? (
          <div className="form-error">
            {apiMessage(query.error, "Could not load owners.")}
          </div>
        ) : (query.data?.data.length ?? 0) === 0 ? (
          <div className="empty-state">
            <strong>No fleet owners yet</strong>
            <p>Add an owner to enable vehicle registration.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>OWNER</th>
                  <th>PHONE</th>
                </tr>
              </thead>
              <tbody>
                {query.data?.data.map((owner) => (
                  <tr key={owner._id}>
                    <td>
                      <strong>{owner.name}</strong>
                    </td>
                    <td>{owner.phone || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
function AuditView() {
  const query = useAuditLogsQuery();
  const rows = query.data?.data ?? [];
  return (
    <section className="feature-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">WORKSPACE SECURITY</p>
          <h1>Activity log</h1>
          <p className="subheading">
            Recent administrative and operations events.
          </p>
        </div>
      </div>
      <section className="panel admin-form-panel">
        {query.isLoading ? (
          <div className="inline-notice">Loading activity…</div>
        ) : query.error ? (
          <div className="form-error">
            {apiMessage(
              query.error,
              "Activity log is available to administrators.",
            )}
             ̰
          </div>
        ) : !rows.length ? (
          <div className="empty-state">
            <strong>No activity recorded yet</strong>
            <p>Actions will appear here as your team uses Fleetline.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>EVENT</th>
                  <th>RESOURCE</th>
                  <th>WHEN</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row._id}>
                    <td>
                      <strong>{formatLabel(row.action)}</strong>
                    </td>
                    <td>
                      {row.resourceType
                        ? `${row.resourceType} ${shortId(row.resourceId)}`
                        : "—"}
                    </td>
                    <td>
                      {row.createdAt
                        ? new Date(row.createdAt).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
function Dashboard() {
  const dispatch = useDispatch();
  const [logout] = useLogoutMutation();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState("Overview");
  const [createOpen, setCreateOpen] = useState(false);
  const [assigningShipment, setAssigningShipment] =
    useState<ShipmentRecord | null>(null);
  const [createdCode, setCreatedCode] = useState("");
  const userQuery = useCurrentUserQuery();
  const sessionUser = useSelector((state: RootState) => state.session.user);
  const userName =
    userQuery.data?.user.name || sessionUser?.name || "Your workspace";
  const role = userQuery.data?.user.role || sessionUser?.role || "";
  const shipmentQuery = useShipmentsQuery(undefined, {
    skip: !role || role === "DRIVER",
  });
  const tripQuery = useTripsQuery(undefined, { skip: !role });
  const canCreateShipment = [
    "SUPER_ADMIN",
    "ADMIN",
    "DISPATCHER",
    "CUSTOMER",
  ].includes(role);
  const canAssignShipment = ["SUPER_ADMIN", "ADMIN", "DISPATCHER"].includes(
    role,
  );
  const shipmentRows = shipmentQuery.data?.data ?? [];
  const tripRows = tripQuery.data?.data ?? [];
  const inTransit = shipmentRows.filter((shipment) =>
    ["IN_TRANSIT", "DRIVER_ACCEPTED", "ARRIVED_PICKUP", "LOADED"].includes(
      shipment.status,
    ),
  ).length;
  const activeTrips = tripRows.filter(
    (trip) => trip.status === "IN_PROGRESS",
  ).length;
  const needsAssignment = shipmentRows.filter(
    (shipment) => shipment.status === "BOOKED",
  ).length;
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(role);
  const canSeeFleet = [
    "SUPER_ADMIN",
    "ADMIN",
    "DISPATCHER",
    "OWNER",
    "AUDITOR",
  ].includes(role);
  const canSeeOwners = [
    "SUPER_ADMIN",
    "ADMIN",
    "DISPATCHER",
    "AUDITOR",
  ].includes(role);
  const pageItems = [
    { label: "Overview", icon: "◫" },
    { label: "Shipments", icon: "▤" },
    { label: "Trips", icon: "↗" },
    { label: "Live tracking", icon: "⌖" },
    ...(canSeeFleet
      ? [
          { label: "Drivers", icon: "♙" },
          { label: "Vehicles", icon: "▰" },
        ]
      : []),
    ...(canSeeOwners ? [{ label: "Owners", icon: "♙" }] : []),
    ...(isAdmin
      ? [
          { label: "Customers", icon: "♧" },
          { label: "Reports", icon: "▥" },
          { label: "Activity log", icon: "≋" },
        ]
      : []),
    { label: "Notifications", icon: "♢" },
  ].filter(
    (item) =>
      role !== "DRIVER" ||
      ["Trips", "Live tracking", "Notifications"].includes(item.label),
  );
  const pageDescriptions: Record<string, string> = {
    Overview: "Your operations at a glance",
    Shipments: "Create and manage customer bookings",
    Trips: "Coordinate assigned drivers and vehicles",
    "Live tracking": "Monitor recent GPS updates from active trips",
  };
  useEffect(() => {
    if (role === "DRIVER" && activePage === "Overview") setActivePage("Trips");
  }, [role, activePage]);
  async function handleLogout() {
    try {
      await logout().unwrap();
    } catch {
      /* Clear local state even when the API is unavailable. */
    } finally {
      dispatch(signedOut());
    }
  }
  function handleCreated(code: string) {
    setCreatedCode(code);
    setCreateOpen(false);
    setActivePage("Shipments");
  }
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">F</span>
          <span>
            Fleetline<small>LOGISTICS</small>
          </span>
        </div>
        <p className="nav-heading">WORKSPACE</p>
        <nav>
          {pageItems.map((item) => (
            <button
              type="button"
              className={`workspace-nav-item ${activePage === item.label ? "active" : ""}`}
              key={item.label}
              onClick={() => {
                setActivePage(item.label);
                setCreatedCode("");
              }}
            >
              <span className="nav-dot">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="avatar">
            {userName
              .split(/\s+/)
              .map((part) => part[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
          <div className="account-name">
            <strong>{userName}</strong>
            <small>{role ? formatLabel(role) : "Team member"}</small>
          </div>
          <div className="account-menu">
            <button
              className="account-menu-trigger"
              aria-label="Account menu"
              aria-haspopup="menu"
              aria-expanded={accountMenuOpen}
              onClick={() => setAccountMenuOpen((open) => !open)}
            >
              ···
            </button>
            {accountMenuOpen && (
              <div className="account-menu-dropdown" role="menu">
                <button
                  className="sign-out-button"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
      <section className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> {activePage}
          </div>
          <div className="top-actions">
            <span className="today">⌑ &nbsp;Fleet operations</span>
            <div className="avatar small-avatar">
              {userName
                .split(/\s+/)
                .map((part) => part[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
          </div>
        </header>
        <div className="content feature-content">
          {activePage === "Overview" ? (
            <>
              <div className="welcome-row">
                <div>
                  <p className="eyebrow">OPERATIONS OVERVIEW</p>
                  <h1>
                    Welcome, {userName.split(" ")[0]} <span>✦</span>
                  </h1>
                  <p className="subheading">
                    {pageDescriptions.Overview}. Keep every shipment moving.
                  </p>
                </div>
                {canCreateShipment && (
                  <button
                    className="primary-button"
                    onClick={() => {
                      setCreatedCode("");
                      setCreateOpen(true);
                    }}
                  >
                    ＋ &nbsp;Create shipment
                  </button>
                )}
              </div>
              <div className="metric-grid">
                {[
                  {
                    label: "Total shipments",
                    value: shipmentQuery.isLoading ? "—" : shipmentRows.length,
                    change: "Across your organization",
                  },
                  {
                    label: "Active trips",
                    value: tripQuery.isLoading ? "—" : activeTrips,
                    change: "Currently on the road",
                  },
                  {
                    label: "In transit",
                    value: shipmentQuery.isLoading ? "—" : inTransit,
                    change: "Shipment status updates",
                  },
                  {
                    label: "Needs assignment",
                    value: shipmentQuery.isLoading ? "—" : needsAssignment,
                    change: "Booked and ready to dispatch",
                  },
                ].map((item, index) => (
                  <article className="metric-card" key={item.label}>
                    <div className="metric-top">
                      <span>{item.label}</span>
                      <span className={`metric-icon icon-${index}`}>
                        {["▤", "↗", "✓", "!"][index]}
                      </span>
                    </div>
                    <strong>{item.value}</strong>
                    <small>{item.change}</small>
                  </article>
                ))}
              </div>
              <section className="panel shipments-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Recent shipments</h2>
                    <p>Latest bookings from the shipment API</p>
                  </div>
                  <button
                    className="table-link-button"
                    onClick={() => setActivePage("Shipments")}
                  >
                    View all shipments <span>→</span>
                  </button>
                </div>
                {shipmentQuery.isLoading ? (
                  <div className="inline-notice">Loading shipments…</div>
                ) : shipmentQuery.error ? (
                  <div className="form-error">
                    {apiMessage(
                      shipmentQuery.error,
                      "Could not load shipments.",
                    )}
                  </div>
                ) : (
                  <ShipmentTable rows={shipmentRows.slice(0, 6)} />
                )}
              </section>
              <div className="quick-links">
                <button onClick={() => setActivePage("Trips")}>
                  <span>↗</span>
                  <strong>Manage trips</strong>
                  <small>{tripRows.length} trip records</small>
                </button>
                <button onClick={() => setActivePage("Live tracking")}>
                  <span>⌖</span>
                  <strong>Live tracking</strong>
                  <small>{activeTrips} trips currently active</small>
                </button>
                <button onClick={() => setActivePage("Shipments")}>
                  <span>▤</span>
                  <strong>View shipments</strong>
                  <small>{shipmentRows.length} total bookings</small>
                </button>
              </div>
            </>
          ) : activePage === "Shipments" ? (
            <section className="feature-page">
              <div className="page-heading">
                <div>
                  <p className="eyebrow">BOOKINGS & DELIVERY</p>
                  <h1>Shipments</h1>
                  <p className="subheading">
                    Create bookings, review routes, and assign trips.
                  </p>
                </div>
                {canCreateShipment && (
                  <button
                    className="primary-button"
                    onClick={() => {
                      setCreatedCode("");
                      setCreateOpen(true);
                    }}
                  >
                    ＋ &nbsp;Create shipment
                  </button>
                )}
              </div>
              {createdCode && (
                <div className="success-notice">
                  <span>✓</span>
                  <div>
                    <strong>Shipment created</strong>
                    <p>
                      Tracking code: <b>{createdCode}</b>
                    </p>
                  </div>
                  <button
                    onClick={() => setCreatedCode("")}
                    aria-label="Dismiss"
                  >
                    ×
                  </button>
                </div>
              )}
              <section className="panel shipments-panel">
                {shipmentQuery.isLoading ? (
                  <div className="inline-notice">Loading shipments…</div>
                ) : shipmentQuery.error ? (
                  <div className="form-error">
                    {apiMessage(
                      shipmentQuery.error,
                      "Could not load shipments. Sign in again and retry.",
                    )}
                  </div>
                ) : (
                  <ShipmentTable
                    rows={shipmentRows}
                    onAssign={
                      canAssignShipment
                        ? (shipment) => setAssigningShipment(shipment)
                        : undefined
                    }
                    canUpdateStatus={[
                      "SUPER_ADMIN",
                      "ADMIN",
                      "DISPATCHER",
                      "DRIVER",
                    ].includes(role)}
                  />
                )}
              </section>
            </section>
          ) : activePage === "Trips" ? (
            <TripsView />
          ) : activePage === "Live tracking" ? (
            <TrackingView />
          ) : activePage === "Drivers" || activePage === "Vehicles" ? (
            <FleetView section={activePage} role={role} />
          ) : activePage === "Owners" ? (
            <OwnersView canCreate={isAdmin} />
          ) : activePage === "Customers" ? (
            <CustomersView />
          ) : activePage === "Reports" ? (
            <ReportsView />
          ) : activePage === "Activity log" ? (
            <AuditView />
          ) : (
            <NotificationsView />
          )}
          {createOpen && (
            <ShipmentCreateDialog
              onClose={() => setCreateOpen(false)}
              onCreated={handleCreated}
            />
          )}
          {assigningShipment && (
            <AssignmentDialog
              shipment={assigningShipment}
              onClose={() => setAssigningShipment(null)}
            />
          )}
        </div>
      </section>
    </main>
  );
}
function Login({
  onBack,
  initialRegister = false,
}: {
  onBack: () => void;
  initialRegister?: boolean;
}) {
  const dispatch = useDispatch();
  const [login, { isLoading, error }] = useLoginMutation();
  const [register, { isLoading: isRegistering, error: registerError }] =
    useRegisterMutation();
  const [isRegister, setIsRegister] = useState(initialRegister);
  const [name, setName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      const result = isRegister
        ? await register({ name, organizationName, email, password }).unwrap()
        : await login({ email, password }).unwrap();
      dispatch(signedIn(result));
    } catch {
      /* The form shows a generic error below. */
    }
  }
  return (
    <main className="login-shell">
      <button className="auth-home-button" type="button" onClick={onBack}>
        ← <span>Back to Fleetline</span>
      </button>
      <form className="login-card" onSubmit={submit}>
        <div className="brand">
          <span className="brand-mark">F</span>
          <span>
            Fleetline<small>LOGISTICS</small>
          </span>
        </div>
        <h1>{isRegister ? "Create your workspace" : "Welcome back"}</h1>
        <p>
          {isRegister
            ? "Register your organization to get started."
            : "Sign in to manage your operations."}
        </p>
        {isRegister && (
          <>
            <label>
              Full name
              <input
                type="text"
                required
                minLength={2}
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              Organization
              <input
                type="text"
                required
                minLength={2}
                autoComplete="organization"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
              />
            </label>
          </>
        )}
        <label>
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            autoComplete={isRegister ? "new-password" : "current-password"}
            minLength={isRegister ? 12 : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {(error || registerError) && (
          <div className="login-error">
            {isRegister
              ? "Could not create account. Check your details; the email may already be registered."
              : "Could not sign in. Check your details and try again."}
          </div>
        )}
        <button
          className="primary-button login-button"
          disabled={isLoading || isRegistering}
        >
          {isLoading || isRegistering
            ? "Please wait…"
            : isRegister
              ? "Create account"
              : "Sign in"}
        </button>
        <button
          type="button"
          className="auth-toggle"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister
            ? "Already have an account? Sign in"
            : "New here? Create an account"}
        </button>
      </form>
    </main>
  );
}
export default function App() {
  const token = useSelector((s: RootState) => s.session.accessToken);
  const dispatch = useDispatch();
  const [refresh] = useRefreshSessionMutation();
  const [checked, setChecked] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);
  useEffect(() => {
    if (!token && !checked) {
      refresh()
        .unwrap()
        .then((result) =>
          dispatch(
            signedIn({
              accessToken: result.accessToken,
              user: {
                id: "",
                name: "",
                email: "",
                role: "",
                organizationId: "",
              },
            }),
          ),
        )
        .catch(() => {})
        .finally(() => setChecked(true));
    }
  }, [token, checked, refresh, dispatch]);
  if (!checked && !token)
    return (
      <main className="login-shell">
        <div className="login-loading">Loading your workspace…</div>
      </main>
    );
  if (token) return <Dashboard />;
  if (authMode)
    return (
      <Login
        initialRegister={authMode === "register"}
        onBack={() => setAuthMode(null)}
      />
    );
  return (
    <Landing
      onLogin={() => setAuthMode("login")}
      onRegister={() => setAuthMode("register")}
    />
  );
}
