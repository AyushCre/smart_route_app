import { z } from "zod";

// Zod validation schemas
export const userSchema = z.object({
  _id: z.string().optional(),
  username: z.string(),
  password: z.string(),
  role: z.string().default("driver"),
  name: z.string(),
});

export const vehicleSchema = z.object({
  _id: z.string().optional(),
  vehicleNumber: z.string(),
  driverName: z.string(),
  driverId: z.string().optional(),
  status: z.string().default("idle"),
  latitude: z.number(),
  longitude: z.number(),
  speed: z.number().default(0),
  fuelLevel: z.number().default(100),
  temperature: z.number().optional(),
  currentRouteId: z.string().optional(),
  routeCompletion: z.number().default(0),
  lastUpdate: z.date().default(() => new Date()),
});

export const deliverySchema = z.object({
  _id: z.string().optional(),
  orderId: z.string(),
  status: z.string().default("pending"),
  customerId: z.string(),
  customerName: z.string(),
  pickupAddress: z.string(),
  pickupLat: z.number(),
  pickupLng: z.number(),
  deliveryAddress: z.string(),
  deliveryLat: z.number(),
  deliveryLng: z.number(),
  vehicleId: z.string().optional(),
  routeId: z.string().optional(),
  scheduledTime: z.date().optional(),
  estimatedDeliveryTime: z.date().optional(),
  actualDeliveryTime: z.date().optional(),
  priority: z.string().default("normal"),
  packageWeight: z.number().optional(),
  createdAt: z.date().default(() => new Date()),
});

export const routeSchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
  vehicleId: z.string().optional(),
  status: z.string().default("planned"),
  algorithm: z.string().default("dijkstra"),
  totalDistance: z.number(),
  estimatedDuration: z.number(),
  estimatedCost: z.number(),
  actualCost: z.number().optional(),
  waypoints: z.string(),
  pathCoordinates: z.string(),
  createdAt: z.date().default(() => new Date()),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
});

export const alertSchema = z.object({
  _id: z.string().optional(),
  type: z.string(),
  severity: z.string().default("info"),
  message: z.string(),
  vehicleId: z.string().optional(),
  deliveryId: z.string().optional(),
  routeId: z.string().optional(),
  isRead: z.boolean().default(false),
  metadata: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
});

export const iotSensorDataSchema = z.object({
  _id: z.string().optional(),
  deviceId: z.string(),
  vehicleId: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  speed: z.number(),
  fuelLevel: z.number(),
  temperature: z.number().optional(),
  engineStatus: z.string().default("running"),
  connectionStatus: z.string().default("connected"),
  timestamp: z.date().default(() => new Date()),
});

// Insert schemas (omit auto-generated fields)
export const insertUserSchema = userSchema.omit({ _id: true });
export const insertVehicleSchema = vehicleSchema.omit({ _id: true, lastUpdate: true });
export const insertDeliverySchema = deliverySchema.omit({ _id: true, createdAt: true });
export const insertRouteSchema = routeSchema.omit({ _id: true, createdAt: true });
export const insertAlertSchema = alertSchema.omit({ _id: true, createdAt: true });
export const insertIotSensorDataSchema = iotSensorDataSchema.omit({ _id: true, timestamp: true });

// Type definitions
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Vehicle = z.infer<typeof vehicleSchema>;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Delivery = z.infer<typeof deliverySchema>;
export type InsertDelivery = z.infer<typeof insertDeliverySchema>;
export type Route = z.infer<typeof routeSchema>;
export type InsertRoute = z.infer<typeof insertRouteSchema>;
export type Alert = z.infer<typeof alertSchema>;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type IotSensorData = z.infer<typeof iotSensorDataSchema>;
export type InsertIotSensorData = z.infer<typeof insertIotSensorDataSchema>;

export type DashboardMetrics = {
  activeDeliveries: number;
  completedToday: number;
  activeVehicles: number;
  averageDeliveryTime: number;
  onTimePercentage: number;
  totalRevenue: number;
  pendingAlerts: number;
  routeEfficiency: number;
};
