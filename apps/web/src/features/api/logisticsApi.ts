import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
export type ShipmentRecord = {
  _id: string;
  trackingCode: string;
  status: string;
  pickup: {
    address?: string;
    contactName?: string;
  };
  delivery: {
    address?: string;
    contactName?: string;
  };
  goods: Array<{
    description: string;
    quantity: number;
    weightKg?: number;
  }>;
  scheduledPickup?: string;
  estimatedDelivery?: string;
  assignedDriverId?: string;
  assignedVehicleId?: string;
  currentTripId?: string;
  createdAt?: string;
};
export type TripRecord = {
  _id: string;
  shipmentId: string;
  driverId: string;
  vehicleId: string;
  status: string;
  shipmentStatus?: string;
  trackingCode?: string;
  startedAt?: string;
  createdAt?: string;
};
export type DriverRecord = {
  _id: string;
  status: string;
  userId: string;
};
export type VehicleRecord = {
  _id: string;
  status: string;
  registrationNumber: string;
  type: string;
};
export type OwnerRecord = {
  _id: string;
  name: string;
  phone?: string;
};
export type UserRecord = {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt?: string;
};
export type NotificationRecord = {
  _id: string;
  title: string;
  body: string;
  type: string;
  readAt?: string;
  createdAt?: string;
};
export type AuditRecord = {
  _id: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  createdAt?: string;
};
export type LocationRecord = {
  _id: string;
  point: {
    coordinates: [number, number];
  };
  speed?: number;
  heading?: number;
  recordedAt: string;
};
type ListResponse<T> = {
  data: T[];
};
export type CreateShipmentInput = {
  pickup: {
    address: string;
    contactName?: string;
    contactPhone?: string;
  };
  delivery: {
    address: string;
    contactName?: string;
    contactPhone?: string;
  };
  goods: Array<{
    description: string;
    quantity: number;
    weightKg?: number;
    fragile?: boolean;
    hazardous?: boolean;
  }>;
  scheduledPickup?: string;
  estimatedDelivery?: string;
};
type RootState = {
  session: {
    accessToken: string | null;
  };
};
export const logisticsApi = createApi({
  reducerPath: "logisticsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? "/api/v1",
    credentials: "include",
    prepareHeaders(headers, { getState }) {
      const token = (getState() as RootState).session.accessToken;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: [
    "Shipment",
    "Trip",
    "Vehicle",
    "Driver",
    "Notification",
    "Tracking",
    "Admin",
    "Owner",
  ],
  endpoints: (builder) => ({
    refreshSession: builder.mutation<
      {
        accessToken: string;
      },
      void
    >({ query: () => ({ url: "/auth/refresh", method: "POST" }) }),
    login: builder.mutation<
      {
        accessToken: string;
        user: {
          id: string;
          name: string;
          email: string;
          role: string;
          organizationId: string;
        };
      },
      {
        email: string;
        password: string;
      }
    >({ query: (body) => ({ url: "/auth/login", method: "POST", body }) }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),
    register: builder.mutation<
      {
        accessToken: string;
        user: {
          id: string;
          name: string;
          email: string;
          role: string;
          organizationId: string;
        };
      },
      {
        name: string;
        organizationName: string;
        email: string;
        password: string;
      }
    >({ query: (body) => ({ url: "/auth/register", method: "POST", body }) }),
    currentUser: builder.query<
      {
        user: {
          name: string;
          email: string;
          role: string;
        };
      },
      void
    >({ query: () => "/auth/me" }),
    shipments: builder.query<ListResponse<ShipmentRecord>, void>({
      query: () => "/shipments",
      providesTags: ["Shipment"],
    }),
    createShipment: builder.mutation<
      {
        data: ShipmentRecord;
        publicTrackingToken: string;
      },
      CreateShipmentInput
    >({
      query: (body) => ({ url: "/shipments", method: "POST", body }),
      invalidatesTags: ["Shipment"],
    }),
    assignShipment: builder.mutation<
      {
        data: ShipmentRecord;
        trip: TripRecord;
      },
      {
        id: string;
        driverId: string;
        vehicleId: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/shipments/${id}/assign`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Shipment", "Trip", "Driver", "Vehicle"],
    }),
    updateShipmentStatus: builder.mutation<
      {
        data: ShipmentRecord;
      },
      {
        id: string;
        status: string;
      }
    >({
      query: ({ id, status }) => ({
        url: `/shipments/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Shipment"],
    }),
    createProofOfDelivery: builder.mutation<
      unknown,
      {
        shipmentId: string;
        recipientName: string;
        latitude: number;
        longitude: number;
      }
    >({
      query: ({ shipmentId, ...body }) => ({
        url: `/proof-of-delivery/${shipmentId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Shipment", "Trip", "Driver", "Vehicle"],
    }),
    trips: builder.query<ListResponse<TripRecord>, void>({
      query: () => "/trips",
      providesTags: ["Trip"],
    }),
    acceptTrip: builder.mutation<
      {
        data: TripRecord;
      },
      string
    >({
      query: (id) => ({ url: `/trips/${id}/accept`, method: "POST" }),
      invalidatesTags: ["Trip"],
    }),
    startTrip: builder.mutation<
      {
        data: TripRecord;
      },
      string
    >({
      query: (id) => ({ url: `/trips/${id}/start`, method: "POST" }),
      invalidatesTags: ["Trip", "Driver", "Vehicle"],
    }),
    trackingHistory: builder.query<ListResponse<LocationRecord>, string>({
      query: (id) => `/tracking/trips/${id}`,
      providesTags: ["Tracking"],
    }),
    sendLocation: builder.mutation<
      {
        accepted: boolean;
        locationId: string;
      },
      {
        latitude: number;
        longitude: number;
        accuracy?: number;
        speed?: number;
        heading?: number;
        timestamp: string;
      }
    >({
      query: (body) => ({ url: "/tracking/location", method: "POST", body }),
      invalidatesTags: ["Tracking"],
    }),
    drivers: builder.query<ListResponse<DriverRecord>, void>({
      query: () => "/drivers",
      providesTags: ["Driver"],
    }),
    vehicles: builder.query<ListResponse<VehicleRecord>, void>({
      query: () => "/vehicles",
      providesTags: ["Vehicle"],
    }),
    notifications: builder.query<
      {
        data: unknown[];
      },
      void
    >({ query: () => "/notifications", providesTags: ["Notification"] }),
    markNotificationRead: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: "POST" }),
      invalidatesTags: ["Notification"],
    }),
    owners: builder.query<ListResponse<OwnerRecord>, void>({
      query: () => "/owners",
      providesTags: ["Owner"],
    }),
    createOwner: builder.mutation<
      {
        data: OwnerRecord;
      },
      {
        name: string;
        phone?: string;
      }
    >({
      query: (body) => ({ url: "/owners", method: "POST", body }),
      invalidatesTags: ["Owner"],
    }),
    createVehicle: builder.mutation<
      {
        data: VehicleRecord;
      },
      {
        ownerId: string;
        registrationNumber: string;
        type: string;
        make?: string;
        model?: string;
        capacityKg?: number;
      }
    >({
      query: (body) => ({ url: "/vehicles", method: "POST", body }),
      invalidatesTags: ["Vehicle"],
    }),
    createAdminUser: builder.mutation<
      {
        data: UserRecord;
      },
      {
        name: string;
        email: string;
        password: string;
        role: string;
      }
    >({
      query: (body) => ({ url: "/admin/users", method: "POST", body }),
      invalidatesTags: ["Admin"],
    }),
    adminUsers: builder.query<ListResponse<UserRecord>, void>({
      query: () => "/admin/users",
      providesTags: ["Admin"],
    }),
    setUserStatus: builder.mutation<
      {
        data: UserRecord;
      },
      {
        id: string;
        status: "ACTIVE" | "SUSPENDED";
      }
    >({
      query: ({ id, status }) => ({
        url: `/admin/users/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Admin"],
    }),
    createDriver: builder.mutation<
      {
        data: DriverRecord;
      },
      {
        userId: string;
        licenseNumber: string;
        licenseExpiry: string;
      }
    >({
      query: (body) => ({ url: "/drivers", method: "POST", body }),
      invalidatesTags: ["Driver"],
    }),
    reportSummary: builder.query<
      {
        data: {
          shipmentsByStatus: Array<{
            _id: string;
            count: number;
          }>;
          activeTrips: number;
          availableDrivers: number;
          availableVehicles: number;
        };
      },
      void
    >({ query: () => "/admin/reports/summary" }),
    auditLogs: builder.query<ListResponse<AuditRecord>, void>({
      query: () => "/admin/audit?limit=100",
    }),
  }),
});
export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshSessionMutation,
  useCurrentUserQuery,
  useShipmentsQuery,
  useCreateShipmentMutation,
  useAssignShipmentMutation,
  useUpdateShipmentStatusMutation,
  useCreateProofOfDeliveryMutation,
  useTripsQuery,
  useAcceptTripMutation,
  useStartTripMutation,
  useTrackingHistoryQuery,
  useSendLocationMutation,
  useDriversQuery,
  useVehiclesQuery,
  useNotificationsQuery,
  useMarkNotificationReadMutation,
  useOwnersQuery,
  useCreateOwnerMutation,
  useCreateVehicleMutation,
  useCreateAdminUserMutation,
  useAdminUsersQuery,
  useSetUserStatusMutation,
  useCreateDriverMutation,
  useReportSummaryQuery,
  useAuditLogsQuery,
} = logisticsApi;
