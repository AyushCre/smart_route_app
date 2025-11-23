import {
  type User,
  type InsertUser,
  type Vehicle,
  type InsertVehicle,
  type Delivery,
  type InsertDelivery,
  type Route,
  type InsertRoute,
  type Alert,
  type InsertAlert,
  type IotSensorData,
  type InsertIotSensorData,
  type DashboardMetrics,
  users,
  vehicles,
  deliveries,
  routes,
  alerts,
  iotSensorData,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getVehicles(): Promise<Vehicle[]>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle | undefined>;
  
  getDeliveries(): Promise<Delivery[]>;
  getDelivery(id: string): Promise<Delivery | undefined>;
  createDelivery(delivery: InsertDelivery): Promise<Delivery>;
  updateDelivery(id: string, delivery: Partial<Delivery>): Promise<Delivery | undefined>;
  
  getRoutes(): Promise<Route[]>;
  getRoute(id: string): Promise<Route | undefined>;
  createRoute(route: InsertRoute): Promise<Route>;
  updateRoute(id: string, route: Partial<Route>): Promise<Route | undefined>;
  
  getAlerts(): Promise<Alert[]>;
  getAlert(id: string): Promise<Alert | undefined>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: string, alert: Partial<Alert>): Promise<Alert | undefined>;
  markAlertAsRead(id: string): Promise<void>;
  deleteAlert(id: string): Promise<void>;
  
  getIotSensorData(): Promise<IotSensorData[]>;
  createIotSensorData(data: InsertIotSensorData): Promise<IotSensorData>;
  
  getDashboardMetrics(): Promise<DashboardMetrics>;
}

export class DbStorage implements IStorage {
  constructor(private db: any) {}

  async seedIfEmpty(): Promise<void> {
    const vehicleCount = await this.db.select().from(vehicles).limit(1);
    if (vehicleCount.length > 0) return;
    
    const memStorage = new MemStorage();
    const vehicleList = await memStorage.getVehicles();
    const deliveryList = await memStorage.getDeliveries();
    const routeList = await memStorage.getRoutes();
    const alertList = await memStorage.getAlerts();
    const sensorList = await memStorage.getIotSensorData();

    for (const vehicle of vehicleList) {
      const { id, lastUpdate, ...insertData } = vehicle;
      await this.db.insert(vehicles).values({
        ...insertData,
        latitude: Math.round(insertData.latitude * 100000) / 100000,
        longitude: Math.round(insertData.longitude * 100000) / 100000,
        speed: Math.round(insertData.speed * 100) / 100,
        fuelLevel: Math.round(insertData.fuelLevel * 100) / 100,
        temperature: insertData.temperature ? Math.round(insertData.temperature * 100) / 100 : null,
        routeCompletion: Math.round(insertData.routeCompletion * 100) / 100,
      });
    }
    for (const delivery of deliveryList) {
      const { id, createdAt, ...insertData } = delivery;
      await this.db.insert(deliveries).values({
        ...insertData,
        pickupLat: Math.round(insertData.pickupLat * 100000) / 100000,
        pickupLng: Math.round(insertData.pickupLng * 100000) / 100000,
        deliveryLat: Math.round(insertData.deliveryLat * 100000) / 100000,
        deliveryLng: Math.round(insertData.deliveryLng * 100000) / 100000,
        packageWeight: insertData.packageWeight ? Math.round(insertData.packageWeight * 100) / 100 : null,
      });
    }
    for (const route of routeList) {
      const { id, createdAt, ...insertData } = route;
      await this.db.insert(routes).values({
        ...insertData,
        totalDistance: Math.round(insertData.totalDistance * 100) / 100,
        estimatedDuration: Math.round(insertData.estimatedDuration),
        estimatedCost: Math.round(insertData.estimatedCost * 100) / 100,
        actualCost: insertData.actualCost ? Math.round(insertData.actualCost * 100) / 100 : null,
      });
    }
    for (const alert of alertList) {
      const { id, createdAt, ...insertData } = alert;
      await this.db.insert(alerts).values(insertData);
    }
    for (const sensor of sensorList) {
      const { id, timestamp, ...insertData } = sensor;
      await this.db.insert(iotSensorData).values({
        ...insertData,
        latitude: Math.round(insertData.latitude * 100000) / 100000,
        longitude: Math.round(insertData.longitude * 100000) / 100000,
        speed: Math.round(insertData.speed * 100) / 100,
        fuelLevel: Math.round(insertData.fuelLevel * 100) / 100,
        temperature: insertData.temperature ? Math.round(insertData.temperature * 100) / 100 : null,
      });
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getVehicles(): Promise<Vehicle[]> {
    return this.db.select().from(vehicles);
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    const result = await this.db.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);
    return result[0];
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const result = await this.db.insert(vehicles).values(insertVehicle).returning();
    return result[0];
  }

  async updateVehicle(id: string, update: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const result = await this.db.update(vehicles).set(update).where(eq(vehicles.id, id)).returning();
    return result[0];
  }

  async getDeliveries(): Promise<Delivery[]> {
    return this.db.select().from(deliveries);
  }

  async getDelivery(id: string): Promise<Delivery | undefined> {
    const result = await this.db.select().from(deliveries).where(eq(deliveries.id, id)).limit(1);
    return result[0];
  }

  async createDelivery(insertDelivery: InsertDelivery): Promise<Delivery> {
    const result = await this.db.insert(deliveries).values(insertDelivery).returning();
    return result[0];
  }

  async updateDelivery(id: string, update: Partial<Delivery>): Promise<Delivery | undefined> {
    const result = await this.db.update(deliveries).set(update).where(eq(deliveries.id, id)).returning();
    return result[0];
  }

  async getRoutes(): Promise<Route[]> {
    return this.db.select().from(routes);
  }

  async getRoute(id: string): Promise<Route | undefined> {
    const result = await this.db.select().from(routes).where(eq(routes.id, id)).limit(1);
    return result[0];
  }

  async createRoute(insertRoute: InsertRoute): Promise<Route> {
    const result = await this.db.insert(routes).values(insertRoute).returning();
    return result[0];
  }

  async updateRoute(id: string, update: Partial<Route>): Promise<Route | undefined> {
    const result = await this.db.update(routes).set(update).where(eq(routes.id, id)).returning();
    return result[0];
  }

  async getAlerts(): Promise<Alert[]> {
    return this.db.select().from(alerts).orderBy(desc(alerts.createdAt));
  }

  async getAlert(id: string): Promise<Alert | undefined> {
    const result = await this.db.select().from(alerts).where(eq(alerts.id, id)).limit(1);
    return result[0];
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const result = await this.db.insert(alerts).values(insertAlert).returning();
    return result[0];
  }

  async updateAlert(id: string, update: Partial<Alert>): Promise<Alert | undefined> {
    const result = await this.db.update(alerts).set(update).where(eq(alerts.id, id)).returning();
    return result[0];
  }

  async markAlertAsRead(id: string): Promise<void> {
    await this.db.update(alerts).set({ isRead: true }).where(eq(alerts.id, id));
  }

  async deleteAlert(id: string): Promise<void> {
    await this.db.delete(alerts).where(eq(alerts.id, id));
  }

  async getIotSensorData(): Promise<IotSensorData[]> {
    return this.db.select().from(iotSensorData).orderBy(desc(iotSensorData.timestamp)).limit(100);
  }

  async createIotSensorData(insertData: InsertIotSensorData): Promise<IotSensorData> {
    const result = await this.db.insert(iotSensorData).values(insertData).returning();
    return result[0];
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const allDeliveries = await this.db.select().from(deliveries);
    const allVehicles = await this.db.select().from(vehicles);
    const allAlerts = await this.db.select().from(alerts);

    const activeDeliveries = allDeliveries.filter((d: any) => d.status === "in-transit" || d.status === "pending").length;
    const completedToday = allDeliveries.filter((d: any) => {
      const created = new Date(d.createdAt);
      const now = new Date();
      return d.status === "delivered" && created.toDateString() === now.toDateString();
    }).length;
    const activeVehicles = allVehicles.filter((v: any) => v.status === "in-transit").length;

    const completedDeliveries = allDeliveries.filter((d: any) => d.status === "delivered");
    const averageDeliveryTime = completedDeliveries.length > 0
      ? completedDeliveries.reduce((sum: number, d: any) => {
          const scheduled = new Date(d.scheduledTime).getTime();
          const actual = new Date(d.actualDeliveryTime).getTime();
          return sum + (actual - scheduled) / 3600000;
        }, 0) / completedDeliveries.length
      : 0;

    const onTimeCount = completedDeliveries.filter((d: any) => {
      const scheduled = new Date(d.scheduledTime).getTime();
      const actual = new Date(d.actualDeliveryTime).getTime();
      return actual <= scheduled;
    }).length;
    const onTimePercentage = completedDeliveries.length > 0
      ? (onTimeCount / completedDeliveries.length) * 100
      : 0;

    const totalRevenue = allDeliveries.reduce((sum: number, d: any) => sum + (d.actualDeliveryTime ? 25 : 0), 0);
    const pendingAlerts = allAlerts.filter((a: any) => !a.isRead).length;
    const activeRoutes = (await this.db.select().from(routes)).filter((r: any) => r.status === "active");
    const routeEfficiency = activeRoutes.length > 0
      ? (activeRoutes.reduce((sum: number, r: any) => sum + r.totalDistance, 0) / activeRoutes.length / 50) * 100
      : 0;

    return {
      activeDeliveries,
      completedToday,
      activeVehicles,
      averageDeliveryTime,
      onTimePercentage,
      totalRevenue,
      pendingAlerts,
      routeEfficiency,
    };
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private vehicles: Map<string, Vehicle>;
  private deliveries: Map<string, Delivery>;
  private routes: Map<string, Route>;
  private alerts: Map<string, Alert>;
  private iotSensorData: Map<string, IotSensorData>;

  constructor() {
    this.users = new Map();
    this.vehicles = new Map();
    this.deliveries = new Map();
    this.routes = new Map();
    this.alerts = new Map();
    this.iotSensorData = new Map();
    
    this.seedData();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      role: insertUser.role ?? "driver",
      name: insertUser.name,
    };
    this.users.set(id, user);
    return user;
  }

  async getVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values());
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const id = randomUUID();
    const vehicle: Vehicle = {
      id,
      vehicleNumber: insertVehicle.vehicleNumber,
      driverName: insertVehicle.driverName,
      driverId: insertVehicle.driverId ?? null,
      status: insertVehicle.status ?? "idle",
      latitude: insertVehicle.latitude,
      longitude: insertVehicle.longitude,
      speed: insertVehicle.speed ?? 0,
      fuelLevel: insertVehicle.fuelLevel ?? 100,
      temperature: insertVehicle.temperature ?? null,
      currentRouteId: insertVehicle.currentRouteId ?? null,
      routeCompletion: insertVehicle.routeCompletion ?? 0,
      lastUpdate: new Date(),
    };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }

  async updateVehicle(id: string, update: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) return undefined;
    
    const updated: Vehicle = {
      ...vehicle,
      ...update,
      lastUpdate: new Date(),
    };
    this.vehicles.set(id, updated);
    return updated;
  }

  async getDeliveries(): Promise<Delivery[]> {
    return Array.from(this.deliveries.values());
  }

  async getDelivery(id: string): Promise<Delivery | undefined> {
    return this.deliveries.get(id);
  }

  async createDelivery(insertDelivery: InsertDelivery): Promise<Delivery> {
    const id = randomUUID();
    const delivery: Delivery = {
      id,
      orderId: insertDelivery.orderId,
      status: insertDelivery.status ?? "pending",
      customerId: insertDelivery.customerId,
      customerName: insertDelivery.customerName,
      pickupAddress: insertDelivery.pickupAddress,
      pickupLat: insertDelivery.pickupLat,
      pickupLng: insertDelivery.pickupLng,
      deliveryAddress: insertDelivery.deliveryAddress,
      deliveryLat: insertDelivery.deliveryLat,
      deliveryLng: insertDelivery.deliveryLng,
      vehicleId: insertDelivery.vehicleId ?? null,
      routeId: insertDelivery.routeId ?? null,
      scheduledTime: insertDelivery.scheduledTime ?? null,
      estimatedDeliveryTime: insertDelivery.estimatedDeliveryTime ?? null,
      actualDeliveryTime: insertDelivery.actualDeliveryTime ?? null,
      priority: insertDelivery.priority ?? "normal",
      packageWeight: insertDelivery.packageWeight ?? null,
      createdAt: new Date(),
    };
    this.deliveries.set(id, delivery);
    return delivery;
  }

  async updateDelivery(id: string, update: Partial<Delivery>): Promise<Delivery | undefined> {
    const delivery = this.deliveries.get(id);
    if (!delivery) return undefined;
    
    const updated: Delivery = { ...delivery, ...update };
    this.deliveries.set(id, updated);
    return updated;
  }

  async getRoutes(): Promise<Route[]> {
    return Array.from(this.routes.values());
  }

  async getRoute(id: string): Promise<Route | undefined> {
    return this.routes.get(id);
  }

  async createRoute(insertRoute: InsertRoute): Promise<Route> {
    const id = randomUUID();
    const route: Route = {
      id,
      name: insertRoute.name,
      vehicleId: insertRoute.vehicleId ?? null,
      status: insertRoute.status ?? "planned",
      algorithm: insertRoute.algorithm ?? "dijkstra",
      totalDistance: insertRoute.totalDistance,
      estimatedDuration: insertRoute.estimatedDuration,
      estimatedCost: insertRoute.estimatedCost,
      actualCost: insertRoute.actualCost ?? null,
      waypoints: insertRoute.waypoints,
      pathCoordinates: insertRoute.pathCoordinates,
      createdAt: new Date(),
      startedAt: insertRoute.startedAt ?? null,
      completedAt: insertRoute.completedAt ?? null,
    };
    this.routes.set(id, route);
    return route;
  }

  async updateRoute(id: string, update: Partial<Route>): Promise<Route | undefined> {
    const route = this.routes.get(id);
    if (!route) return undefined;
    
    const updated: Route = { ...route, ...update };
    this.routes.set(id, updated);
    return updated;
  }

  async getAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getAlert(id: string): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = randomUUID();
    const alert: Alert = {
      id,
      type: insertAlert.type,
      severity: insertAlert.severity ?? "info",
      message: insertAlert.message,
      vehicleId: insertAlert.vehicleId ?? null,
      deliveryId: insertAlert.deliveryId ?? null,
      routeId: insertAlert.routeId ?? null,
      isRead: insertAlert.isRead ?? false,
      metadata: insertAlert.metadata ?? null,
      createdAt: new Date(),
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async updateAlert(id: string, update: Partial<Alert>): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;
    
    const updated: Alert = { ...alert, ...update };
    this.alerts.set(id, updated);
    return updated;
  }

  async markAlertAsRead(id: string): Promise<void> {
    const alert = this.alerts.get(id);
    if (alert) {
      alert.isRead = true;
      this.alerts.set(id, alert);
    }
  }

  async deleteAlert(id: string): Promise<void> {
    this.alerts.delete(id);
  }

  async getIotSensorData(): Promise<IotSensorData[]> {
    return Array.from(this.iotSensorData.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  async createIotSensorData(insertData: InsertIotSensorData): Promise<IotSensorData> {
    const id = randomUUID();
    const data: IotSensorData = {
      id,
      deviceId: insertData.deviceId,
      vehicleId: insertData.vehicleId,
      latitude: insertData.latitude,
      longitude: insertData.longitude,
      speed: insertData.speed,
      fuelLevel: insertData.fuelLevel,
      temperature: insertData.temperature ?? null,
      engineStatus: insertData.engineStatus ?? "running",
      connectionStatus: insertData.connectionStatus ?? "connected",
      timestamp: new Date(),
    };
    this.iotSensorData.set(id, data);
    return data;
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const deliveries = Array.from(this.deliveries.values());
    const vehicles = Array.from(this.vehicles.values());
    const alerts = Array.from(this.alerts.values());
    const routes = Array.from(this.routes.values());

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeDeliveries = deliveries.filter(
      (d) => d.status === "in-transit" || d.status === "pending"
    ).length;

    const completedToday = deliveries.filter(
      (d) =>
        d.status === "delivered" &&
        d.actualDeliveryTime &&
        new Date(d.actualDeliveryTime) >= today
    ).length;

    const activeVehicles = vehicles.filter(
      (v) => v.status === "in-transit" || v.status === "idle"
    ).length;

    const completedDeliveries = deliveries.filter((d) => d.status === "delivered");
    const onTimeDeliveries = completedDeliveries.filter(
      (d) =>
        d.actualDeliveryTime &&
        d.estimatedDeliveryTime &&
        new Date(d.actualDeliveryTime) <= new Date(d.estimatedDeliveryTime)
    );
    const onTimePercentage = completedDeliveries.length > 0
      ? Math.round((onTimeDeliveries.length / completedDeliveries.length) * 100)
      : 95;

    const averageDeliveryTime = 45;
    const totalRevenue = completedToday * 28.5;
    const pendingAlerts = alerts.filter((a) => !a.isRead).length;

    const completedRoutes = routes.filter((r) => r.status === "completed");
    const routeEfficiency = completedRoutes.length > 0
      ? Math.round(
          completedRoutes.reduce((acc, r) => {
            const ratio = r.actualCost ? r.estimatedCost / r.actualCost : 1;
            return acc + ratio;
          }, 0) / completedRoutes.length * 100
        )
      : 87;

    return {
      activeDeliveries,
      completedToday,
      activeVehicles,
      averageDeliveryTime,
      onTimePercentage,
      totalRevenue,
      pendingAlerts,
      routeEfficiency,
    };
  }

  private seedData() {
    // Odisha and nearby regions (Rourkela, Bondamunda, Sambalpur, Bhubaneswar, Cuttack, Dhenkanal, Patna)
    const odishaCoords = [
      { lat: 22.2369, lng: 84.8549, city: "Rourkela" }, // Center
      { lat: 22.1, lng: 84.7, city: "Bondamunda" },
      { lat: 21.5, lng: 84.0, city: "Sambalpur" },
      { lat: 20.2, lng: 85.8, city: "Bhubaneswar" },
      { lat: 20.5, lng: 85.9, city: "Cuttack" },
      { lat: 20.9, lng: 85.6, city: "Dhenkanal" },
      { lat: 25.5, lng: 85.1, city: "Patna" },
      { lat: 22.5, lng: 84.6, city: "Sundargarh" },
    ];

    const vehicleIds: string[] = [];
    for (let i = 0; i < 5; i++) {
      const coord = odishaCoords[i];
      const vehicle: Vehicle = {
        id: randomUUID(),
        vehicleNumber: `VH-${1001 + i}`,
        driverName: ["Raj Kumar", "Priya Singh", "Arjun Patel", "Neha Sharma", "Vikram Das"][i],
        driverId: null,
        status: ["in-transit", "in-transit", "idle", "in-transit", "idle"][i],
        latitude: coord.lat + (Math.random() - 0.5) * 0.1,
        longitude: coord.lng + (Math.random() - 0.5) * 0.1,
        speed: [45, 38, 0, 52, 0][i],
        fuelLevel: [78, 92, 65, 45, 88][i],
        temperature: 32 + Math.random() * 8,
        currentRouteId: null,
        routeCompletion: [65, 42, 0, 78, 0][i],
        lastUpdate: new Date(),
      };
      this.vehicles.set(vehicle.id, vehicle);
      vehicleIds.push(vehicle.id);
    }

    for (let i = 0; i < 12; i++) {
      const pickupCoord = odishaCoords[Math.floor(Math.random() * odishaCoords.length)];
      const deliveryCoord = odishaCoords[Math.floor(Math.random() * odishaCoords.length)];
      
      const delivery: Delivery = {
        id: randomUUID(),
        orderId: `ORD-${10000 + i}`,
        status: ["pending", "in-transit", "in-transit", "delivered", "in-transit", "pending", "delivered", "delayed", "pending", "pending", "in-transit", "pending"][i],
        customerId: randomUUID(),
        customerName: [
          "Odisha Trading Corp",
          "Rourkela Industries",
          "Eastern Retail Ltd",
          "Bhubaneswar Foods",
          "Cuttack Supplies",
          "Sambalpur Logistics",
          "Patna Warehouse",
          "Dhenkanal Distribution",
          "Jharkhand Markets",
          "Steel City Goods",
          "Eastern Express",
          "Regional Delivery Co",
        ][i],
        pickupAddress: `${1000 + i * 50} ${pickupCoord.city} Market, Odisha`,
        pickupLat: pickupCoord.lat + (Math.random() - 0.5) * 0.05,
        pickupLng: pickupCoord.lng + (Math.random() - 0.5) * 0.05,
        deliveryAddress: `${2000 + i * 50} ${deliveryCoord.city} Main Road, Odisha`,
        deliveryLat: deliveryCoord.lat + (Math.random() - 0.5) * 0.05,
        deliveryLng: deliveryCoord.lng + (Math.random() - 0.5) * 0.05,
        vehicleId: i < 5 ? vehicleIds[i % vehicleIds.length] : null,
        routeId: null,
        scheduledTime: new Date(Date.now() + (i - 6) * 3600000),
        estimatedDeliveryTime: new Date(Date.now() + (i - 4) * 3600000),
        actualDeliveryTime: i === 3 || i === 6 ? new Date() : null,
        priority: ["normal", "high", "normal", "normal", "high", "normal", "low", "normal", "high", "normal", "normal", "normal"][i],
        packageWeight: 5 + Math.random() * 45,
        createdAt: new Date(Date.now() - i * 86400000),
      };
      this.deliveries.set(delivery.id, delivery);
    }

    for (let i = 0; i < 4; i++) {
      const waypoints = [];
      const pathCoords = [];
      const numWaypoints = 3 + Math.floor(Math.random() * 4);
      
      for (let j = 0; j < numWaypoints; j++) {
        const coord = odishaCoords[j % odishaCoords.length];
        waypoints.push({
          lat: coord.lat + (Math.random() - 0.5) * 0.05,
          lng: coord.lng + (Math.random() - 0.5) * 0.05,
          address: `${1000 + j * 200} ${coord.city} Route ${j + 1}`,
        });
        pathCoords.push([
          coord.lat + (Math.random() - 0.5) * 0.05,
          coord.lng + (Math.random() - 0.5) * 0.05,
        ]);
      }

      const route: Route = {
        id: randomUUID(),
        name: `Route-${odishaCoords[i % odishaCoords.length].city}-${String.fromCharCode(65 + i)}`,
        vehicleId: i < vehicleIds.length ? vehicleIds[i] : null,
        status: ["active", "active", "planned", "completed"][i],
        algorithm: ["dijkstra", "astar", "dijkstra", "astar"][i],
        totalDistance: 40 + Math.random() * 60,
        estimatedDuration: 5400 + Math.random() * 5400,
        estimatedCost: 200 + Math.random() * 300,
        actualCost: i === 3 ? 220 + Math.random() * 250 : null,
        waypoints: JSON.stringify(waypoints),
        pathCoordinates: JSON.stringify(pathCoords),
        createdAt: new Date(Date.now() - i * 86400000),
        startedAt: i < 2 ? new Date(Date.now() - 3600000) : null,
        completedAt: i === 3 ? new Date() : null,
      };
      this.routes.set(route.id, route);
    }

    const alertMessages = [
      { severity: "critical", type: "fuel", message: "Vehicle VH-1004 fuel level critically low (15%)" },
      { severity: "warning", type: "delay", message: "Delivery ORD-10007 is running 15 minutes behind schedule" },
      { severity: "info", type: "completed", message: "Route A completed successfully" },
      { severity: "warning", type: "traffic", message: "Heavy traffic detected on Route B" },
      { severity: "critical", type: "maintenance", message: "Vehicle VH-1002 requires immediate maintenance" },
      { severity: "info", type: "new_delivery", message: "New delivery order ORD-10008 assigned" },
    ];

    alertMessages.forEach((alertData, i) => {
      const alert: Alert = {
        id: randomUUID(),
        type: alertData.type,
        severity: alertData.severity,
        message: alertData.message,
        vehicleId: i < 3 ? vehicleIds[i % vehicleIds.length] : null,
        deliveryId: null,
        routeId: null,
        isRead: i > 3,
        metadata: null,
        createdAt: new Date(Date.now() - i * 600000),
      };
      this.alerts.set(alert.id, alert);
    });

    vehicleIds.forEach((vehicleId, i) => {
      const vehicle = this.vehicles.get(vehicleId);
      if (!vehicle) return;

      const sensorData: IotSensorData = {
        id: randomUUID(),
        deviceId: `SENSOR-${1000 + i}`,
        vehicleId: vehicleId,
        latitude: vehicle.latitude,
        longitude: vehicle.longitude,
        speed: vehicle.speed,
        fuelLevel: vehicle.fuelLevel,
        temperature: vehicle.temperature ?? 72,
        engineStatus: vehicle.status === "in-transit" ? "running" : "idle",
        connectionStatus: "connected",
        timestamp: new Date(),
      };
      this.iotSensorData.set(sensorData.id, sensorData);
    });
  }
}

let storage: IStorage = new MemStorage();

async function initializeStorage(): Promise<IStorage> {
  if (process.env.DATABASE_URL) {
    try {
      const db = drizzle(process.env.DATABASE_URL);
      storage = new DbStorage(db);
      await (storage as DbStorage).seedIfEmpty();
      return storage;
    } catch (error) {
      console.error("Failed to initialize database storage, falling back to in-memory:", error);
      storage = new MemStorage();
    }
  }
  return storage;
}

export { initializeStorage, storage };
