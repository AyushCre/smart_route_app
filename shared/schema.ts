import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("driver"),
  name: text("name").notNull(),
});

export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleNumber: text("vehicle_number").notNull().unique(),
  driverName: text("driver_name").notNull(),
  driverId: varchar("driver_id"),
  status: text("status").notNull().default("idle"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  speed: real("speed").notNull().default(0),
  fuelLevel: real("fuel_level").notNull().default(100),
  temperature: real("temperature"),
  currentRouteId: varchar("current_route_id"),
  routeCompletion: real("route_completion").notNull().default(0),
  lastUpdate: timestamp("last_update").notNull().defaultNow(),
});

export const deliveries = pgTable("deliveries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: text("order_id").notNull().unique(),
  status: text("status").notNull().default("pending"),
  customerId: varchar("customer_id").notNull(),
  customerName: text("customer_name").notNull(),
  pickupAddress: text("pickup_address").notNull(),
  pickupLat: real("pickup_lat").notNull(),
  pickupLng: real("pickup_lng").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  deliveryLat: real("delivery_lat").notNull(),
  deliveryLng: real("delivery_lng").notNull(),
  vehicleId: varchar("vehicle_id"),
  routeId: varchar("route_id"),
  scheduledTime: timestamp("scheduled_time"),
  estimatedDeliveryTime: timestamp("estimated_delivery_time"),
  actualDeliveryTime: timestamp("actual_delivery_time"),
  priority: text("priority").notNull().default("normal"),
  packageWeight: real("package_weight"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const routes = pgTable("routes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  vehicleId: varchar("vehicle_id"),
  status: text("status").notNull().default("planned"),
  algorithm: text("algorithm").notNull().default("dijkstra"),
  totalDistance: real("total_distance").notNull(),
  estimatedDuration: integer("estimated_duration").notNull(),
  estimatedCost: real("estimated_cost").notNull(),
  actualCost: real("actual_cost"),
  waypoints: text("waypoints").notNull(),
  pathCoordinates: text("path_coordinates").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
});

export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  severity: text("severity").notNull().default("info"),
  message: text("message").notNull(),
  vehicleId: varchar("vehicle_id"),
  deliveryId: varchar("delivery_id"),
  routeId: varchar("route_id"),
  isRead: boolean("is_read").notNull().default(false),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const iotSensorData = pgTable("iot_sensor_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: text("device_id").notNull(),
  vehicleId: varchar("vehicle_id").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  speed: real("speed").notNull(),
  fuelLevel: real("fuel_level").notNull(),
  temperature: real("temperature"),
  engineStatus: text("engine_status").notNull().default("running"),
  connectionStatus: text("connection_status").notNull().default("connected"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true, lastUpdate: true });
export const insertDeliverySchema = createInsertSchema(deliveries).omit({ id: true, createdAt: true });
export const insertRouteSchema = createInsertSchema(routes).omit({ id: true, createdAt: true });
export const insertAlertSchema = createInsertSchema(alerts).omit({ id: true, createdAt: true });
export const insertIotSensorDataSchema = createInsertSchema(iotSensorData).omit({ id: true, timestamp: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertDelivery = z.infer<typeof insertDeliverySchema>;
export type Delivery = typeof deliveries.$inferSelect;
export type InsertRoute = z.infer<typeof insertRouteSchema>;
export type Route = typeof routes.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertIotSensorData = z.infer<typeof insertIotSensorDataSchema>;
export type IotSensorData = typeof iotSensorData.$inferSelect;

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

export type VehicleMarker = {
  id: string;
  vehicleNumber: string;
  driverName: string;
  latitude: number;
  longitude: number;
  status: string;
  speed: number;
  heading?: number;
};

export type DeliveryWaypoint = {
  id: string;
  orderId: string;
  address: string;
  latitude: number;
  longitude: number;
  type: "pickup" | "delivery";
  status: string;
  scheduledTime?: Date;
};
