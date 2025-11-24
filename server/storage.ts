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
  insertVehicleSchema,
  insertDeliverySchema,
  insertRouteSchema,
  insertAlertSchema,
  insertIotSensorDataSchema,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { MongoClient, ObjectId, Db, Collection } from "mongodb";

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
  private usersCollection: Collection<any>;
  private vehiclesCollection: Collection<any>;
  private deliveriesCollection: Collection<any>;
  private routesCollection: Collection<any>;
  private alertsCollection: Collection<any>;
  private sensorDataCollection: Collection<any>;

  constructor(db: Db) {
    this.usersCollection = db.collection("users");
    this.vehiclesCollection = db.collection("vehicles");
    this.deliveriesCollection = db.collection("deliveries");
    this.routesCollection = db.collection("routes");
    this.alertsCollection = db.collection("alerts");
    this.sensorDataCollection = db.collection("iot_sensor_data");
  }

  async seedIfEmpty(): Promise<void> {
    const vehicleCount = await this.vehiclesCollection.countDocuments();
    if (vehicleCount > 0) return;
    
    const memStorage = new MemStorage();
    const vehicleList = await memStorage.getVehicles();
    const deliveryList = await memStorage.getDeliveries();
    const routeList = await memStorage.getRoutes();
    const alertList = await memStorage.getAlerts();
    const sensorList = await memStorage.getIotSensorData();

    if (vehicleList.length > 0) {
      const vehicles = vehicleList.map(v => {
        const { ...doc } = v;
        return doc;
      });
      await this.vehiclesCollection.insertMany(vehicles);
    }

    if (deliveryList.length > 0) {
      const deliveries = deliveryList.map(d => {
        const { ...doc } = d;
        return doc;
      });
      await this.deliveriesCollection.insertMany(deliveries);
    }

    if (routeList.length > 0) {
      const routes = routeList.map(r => {
        const { ...doc } = r;
        return doc;
      });
      await this.routesCollection.insertMany(routes);
    }

    if (alertList.length > 0) {
      const alerts = alertList.map(a => {
        const { ...doc } = a;
        return doc;
      });
      await this.alertsCollection.insertMany(alerts);
    }

    if (sensorList.length > 0) {
      const sensors = sensorList.map(s => {
        const { ...doc } = s;
        return doc;
      });
      await this.sensorDataCollection.insertMany(sensors);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.usersCollection.findOne({ _id: id });
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.usersCollection.findOne({ username });
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user = { _id: randomUUID(), ...insertUser };
    await this.usersCollection.insertOne(user);
    return user as User;
  }

  async getVehicles(): Promise<Vehicle[]> {
    return this.vehiclesCollection.find({}).toArray();
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    return this.vehiclesCollection.findOne({ _id: id });
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const vehicle = { _id: randomUUID(), ...insertVehicle, lastUpdate: new Date() };
    await this.vehiclesCollection.insertOne(vehicle);
    return vehicle as Vehicle;
  }

  async updateVehicle(id: string, update: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const result = await this.vehiclesCollection.findOneAndUpdate(
      { _id: id },
      { $set: { ...update, lastUpdate: new Date() } },
      { returnDocument: "after" }
    );
    return result.value;
  }

  async getDeliveries(): Promise<Delivery[]> {
    return this.deliveriesCollection.find({}).toArray();
  }

  async getDelivery(id: string): Promise<Delivery | undefined> {
    return this.deliveriesCollection.findOne({ _id: id });
  }

  async createDelivery(insertDelivery: InsertDelivery): Promise<Delivery> {
    const delivery = { _id: randomUUID(), ...insertDelivery, createdAt: new Date() };
    await this.deliveriesCollection.insertOne(delivery);
    return delivery as Delivery;
  }

  async updateDelivery(id: string, update: Partial<Delivery>): Promise<Delivery | undefined> {
    const result = await this.deliveriesCollection.findOneAndUpdate(
      { _id: id },
      { $set: update },
      { returnDocument: "after" }
    );
    return result.value;
  }

  async getRoutes(): Promise<Route[]> {
    return this.routesCollection.find({}).toArray();
  }

  async getRoute(id: string): Promise<Route | undefined> {
    return this.routesCollection.findOne({ _id: id });
  }

  async createRoute(insertRoute: InsertRoute): Promise<Route> {
    const route = { _id: randomUUID(), ...insertRoute, createdAt: new Date() };
    await this.routesCollection.insertOne(route);
    return route as Route;
  }

  async updateRoute(id: string, update: Partial<Route>): Promise<Route | undefined> {
    const result = await this.routesCollection.findOneAndUpdate(
      { _id: id },
      { $set: update },
      { returnDocument: "after" }
    );
    return result.value;
  }

  async getAlerts(): Promise<Alert[]> {
    return this.alertsCollection.find({}).toArray();
  }

  async getAlert(id: string): Promise<Alert | undefined> {
    return this.alertsCollection.findOne({ _id: id });
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const alert = { _id: randomUUID(), ...insertAlert, createdAt: new Date() };
    await this.alertsCollection.insertOne(alert);
    return alert as Alert;
  }

  async updateAlert(id: string, update: Partial<Alert>): Promise<Alert | undefined> {
    const result = await this.alertsCollection.findOneAndUpdate(
      { _id: id },
      { $set: update },
      { returnDocument: "after" }
    );
    return result.value;
  }

  async markAlertAsRead(id: string): Promise<void> {
    await this.alertsCollection.updateOne({ _id: id }, { $set: { isRead: true } });
  }

  async deleteAlert(id: string): Promise<void> {
    await this.alertsCollection.deleteOne({ _id: id });
  }

  async getIotSensorData(): Promise<IotSensorData[]> {
    return this.sensorDataCollection.find({}).toArray();
  }

  async createIotSensorData(insertData: InsertIotSensorData): Promise<IotSensorData> {
    const data = { _id: randomUUID(), ...insertData, timestamp: new Date() };
    await this.sensorDataCollection.insertOne(data);
    return data as IotSensorData;
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const deliveries = await this.deliveriesCollection.find({}).toArray();
    const vehicles = await this.vehiclesCollection.find({}).toArray();
    const alerts = await this.alertsCollection.find({}).toArray();

    const activeDeliveries = deliveries.filter(d => d.status === "in-transit").length;
    const completedToday = deliveries.filter(d => {
      const createdDate = new Date(d.createdAt);
      const today = new Date();
      return d.status === "delivered" && createdDate.toDateString() === today.toDateString();
    }).length;
    const activeVehicles = vehicles.filter(v => v.status !== "idle").length;
    const pendingAlerts = alerts.filter(a => !a.isRead).length;

    const avgDeliveryTime = deliveries.length > 0
      ? deliveries.reduce((sum, d) => {
          if (d.actualDeliveryTime && d.createdAt) {
            return sum + (new Date(d.actualDeliveryTime).getTime() - new Date(d.createdAt).getTime());
          }
          return sum;
        }, 0) / deliveries.length / (1000 * 60)
      : 0;

    const onTimePercentage = deliveries.length > 0
      ? (deliveries.filter(d => {
          if (d.actualDeliveryTime && d.estimatedDeliveryTime) {
            return new Date(d.actualDeliveryTime) <= new Date(d.estimatedDeliveryTime);
          }
          return false;
        }).length / deliveries.length) * 100
      : 0;

    const totalRevenue = deliveries.reduce((sum, d) => sum + (Math.random() * 1000), 0);
    const routeEfficiency = activeVehicles > 0 ? (activeDeliveries / activeVehicles) * 100 : 0;

    return {
      activeDeliveries,
      completedToday,
      activeVehicles,
      averageDeliveryTime: Math.round(avgDeliveryTime),
      onTimePercentage: Math.round(onTimePercentage),
      totalRevenue: Math.round(totalRevenue),
      pendingAlerts,
      routeEfficiency: Math.round(routeEfficiency),
    };
  }
}

export class MemStorage implements IStorage {
  private users: User[] = [];
  private vehicles: Vehicle[] = [];
  private deliveries: Delivery[] = [];
  private routes: Route[] = [];
  private alerts: Alert[] = [];
  private sensorData: IotSensorData[] = [];

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Seed initial data
    const now = new Date();
    const odishaCoords = [
      { lat: 22.2369, lng: 84.8549, name: "Rourkela" },
      { lat: 20.5244, lng: 85.8830, name: "Cuttack" },
      { lat: 19.8135, lng: 85.2055, name: "Bhubaneswar" },
    ];

    // Create 15 vehicles
    for (let i = 0; i < 15; i++) {
      const coord = odishaCoords[i % odishaCoords.length];
      this.vehicles.push({
        _id: randomUUID(),
        vehicleNumber: `VH-${1000 + i}`,
        driverName: ["Rohan Desai", "Aditya Kumar", "Bhavesh Patel", "Anjan Nair", "Mohan Singh"][i % 5],
        driverId: undefined,
        status: i % 3 === 0 ? "in-transit" : "idle",
        latitude: coord.lat + Math.random() * 0.1,
        longitude: coord.lng + Math.random() * 0.1,
        speed: i % 3 === 0 ? Math.random() * 80 : 0,
        fuelLevel: 50 + Math.random() * 50,
        temperature: 35 + Math.random() * 10,
        currentRouteId: undefined,
        routeCompletion: i % 3 === 0 ? Math.random() * 100 : 0,
        lastUpdate: new Date(),
      });
    }

    // Create 30 deliveries
    const cities = [
      { lat: 22.2369, lng: 84.8549, name: "Rourkela" },
      { lat: 24.7955, lng: 84.9994, name: "Gaya" },
      { lat: 25.5941, lng: 85.1376, name: "Patna" },
      { lat: 20.5244, lng: 85.8830, name: "Cuttack" },
      { lat: 19.8135, lng: 85.2055, name: "Bhubaneswar" },
    ];

    for (let i = 0; i < 30; i++) {
      const pickup = cities[i % cities.length];
      const delivery = cities[(i + 1) % cities.length];
      const orderId = `ORD-${10000 + i}`;
      
      const scheduledTime = new Date(now.getTime() + (i * 60 * 60 * 1000));
      const estimatedDeliveryTime = new Date(scheduledTime.getTime() + (3 * 60 * 60 * 1000));

      this.deliveries.push({
        _id: randomUUID(),
        orderId,
        status: ["pending", "in-transit", "delivered"][i % 3],
        customerId: `CUST-${i}`,
        customerName: ["Odisha Trading Corp", "Prime Delivery", "Star Logistics", "Direct Shipping", "Fast Track Delivery"][i % 5],
        pickupAddress: `${1000 + i} ${pickup.name} Market, Odisha`,
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        deliveryAddress: `${2000 + i} ${delivery.name} Main Road, Odisha`,
        deliveryLat: delivery.lat,
        deliveryLng: delivery.lng,
        vehicleId: i < 15 ? this.vehicles[i]._id : undefined,
        routeId: undefined,
        scheduledTime,
        estimatedDeliveryTime,
        actualDeliveryTime: i % 3 === 2 ? new Date(estimatedDeliveryTime.getTime() - Math.random() * 2 * 60 * 60 * 1000) : undefined,
        priority: ["high", "normal", "low"][i % 3],
        packageWeight: 5 + Math.random() * 20,
        createdAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      });
    }

    // Create 6 alerts
    for (let i = 0; i < 6; i++) {
      this.alerts.push({
        _id: randomUUID(),
        type: ["delivery_delay", "fuel_low", "maintenance_required"][i % 3],
        severity: ["info", "warning", "critical"][i % 3],
        message: `Alert for vehicle ${this.vehicles[i].vehicleNumber}: ${["Delivery delayed", "Fuel level low", "Maintenance required"][i % 3]}`,
        vehicleId: this.vehicles[i]._id,
        deliveryId: undefined,
        routeId: undefined,
        isRead: i % 2 === 0,
        metadata: undefined,
        createdAt: new Date(now.getTime() - Math.random() * 60 * 60 * 1000),
      });
    }

    // Create 15 sensor readings
    for (let i = 0; i < 15; i++) {
      this.sensorData.push({
        _id: randomUUID(),
        deviceId: `DEV-${1000 + i}`,
        vehicleId: this.vehicles[i]._id,
        latitude: this.vehicles[i].latitude,
        longitude: this.vehicles[i].longitude,
        speed: this.vehicles[i].speed,
        fuelLevel: this.vehicles[i].fuelLevel,
        temperature: this.vehicles[i].temperature,
        engineStatus: this.vehicles[i].status === "idle" ? "idle" : "running",
        connectionStatus: Math.random() > 0.2 ? "connected" : "unstable",
        timestamp: new Date(),
      });
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(u => u._id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user = { _id: randomUUID(), ...insertUser };
    this.users.push(user);
    return user;
  }

  async getVehicles(): Promise<Vehicle[]> {
    return this.vehicles;
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    return this.vehicles.find(v => v._id === id);
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const vehicle = { _id: randomUUID(), ...insertVehicle, lastUpdate: new Date() };
    this.vehicles.push(vehicle);
    return vehicle;
  }

  async updateVehicle(id: string, update: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const vehicle = this.vehicles.find(v => v._id === id);
    if (!vehicle) return undefined;
    Object.assign(vehicle, { ...update, lastUpdate: new Date() });
    return vehicle;
  }

  async getDeliveries(): Promise<Delivery[]> {
    return this.deliveries;
  }

  async getDelivery(id: string): Promise<Delivery | undefined> {
    return this.deliveries.find(d => d._id === id);
  }

  async createDelivery(insertDelivery: InsertDelivery): Promise<Delivery> {
    const delivery = { _id: randomUUID(), ...insertDelivery, createdAt: new Date() };
    this.deliveries.push(delivery);
    return delivery;
  }

  async updateDelivery(id: string, update: Partial<Delivery>): Promise<Delivery | undefined> {
    const delivery = this.deliveries.find(d => d._id === id);
    if (!delivery) return undefined;
    Object.assign(delivery, update);
    return delivery;
  }

  async getRoutes(): Promise<Route[]> {
    return this.routes;
  }

  async getRoute(id: string): Promise<Route | undefined> {
    return this.routes.find(r => r._id === id);
  }

  async createRoute(insertRoute: InsertRoute): Promise<Route> {
    const route = { _id: randomUUID(), ...insertRoute, createdAt: new Date() };
    this.routes.push(route);
    return route;
  }

  async updateRoute(id: string, update: Partial<Route>): Promise<Route | undefined> {
    const route = this.routes.find(r => r._id === id);
    if (!route) return undefined;
    Object.assign(route, update);
    return route;
  }

  async getAlerts(): Promise<Alert[]> {
    return this.alerts;
  }

  async getAlert(id: string): Promise<Alert | undefined> {
    return this.alerts.find(a => a._id === id);
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const alert = { _id: randomUUID(), ...insertAlert, createdAt: new Date() };
    this.alerts.push(alert);
    return alert;
  }

  async updateAlert(id: string, update: Partial<Alert>): Promise<Alert | undefined> {
    const alert = this.alerts.find(a => a._id === id);
    if (!alert) return undefined;
    Object.assign(alert, update);
    return alert;
  }

  async markAlertAsRead(id: string): Promise<void> {
    const alert = this.alerts.find(a => a._id === id);
    if (alert) alert.isRead = true;
  }

  async deleteAlert(id: string): Promise<void> {
    const idx = this.alerts.findIndex(a => a._id === id);
    if (idx !== -1) this.alerts.splice(idx, 1);
  }

  async getIotSensorData(): Promise<IotSensorData[]> {
    return this.sensorData;
  }

  async createIotSensorData(insertData: InsertIotSensorData): Promise<IotSensorData> {
    const data = { _id: randomUUID(), ...insertData, timestamp: new Date() };
    this.sensorData.push(data);
    return data;
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const activeDeliveries = this.deliveries.filter(d => d.status === "in-transit").length;
    const completedToday = this.deliveries.filter(d => {
      const createdDate = new Date(d.createdAt);
      const today = new Date();
      return d.status === "delivered" && createdDate.toDateString() === today.toDateString();
    }).length;
    const activeVehicles = this.vehicles.filter(v => v.status !== "idle").length;
    const pendingAlerts = this.alerts.filter(a => !a.isRead).length;

    const avgDeliveryTime = this.deliveries.length > 0
      ? this.deliveries.reduce((sum, d) => {
          if (d.actualDeliveryTime && d.createdAt) {
            return sum + (new Date(d.actualDeliveryTime).getTime() - new Date(d.createdAt).getTime());
          }
          return sum;
        }, 0) / this.deliveries.length / (1000 * 60)
      : 0;

    const onTimePercentage = this.deliveries.length > 0
      ? (this.deliveries.filter(d => {
          if (d.actualDeliveryTime && d.estimatedDeliveryTime) {
            return new Date(d.actualDeliveryTime) <= new Date(d.estimatedDeliveryTime);
          }
          return false;
        }).length / this.deliveries.length) * 100
      : 0;

    const totalRevenue = this.deliveries.reduce((sum, d) => sum + (Math.random() * 1000), 0);
    const routeEfficiency = activeVehicles > 0 ? (activeDeliveries / activeVehicles) * 100 : 0;

    return {
      activeDeliveries,
      completedToday,
      activeVehicles,
      averageDeliveryTime: Math.round(avgDeliveryTime),
      onTimePercentage: Math.round(onTimePercentage),
      totalRevenue: Math.round(totalRevenue),
      pendingAlerts,
      routeEfficiency: Math.round(routeEfficiency),
    };
  }
}

let mongoClient: MongoClient | null = null;
export let storage: IStorage;

export async function initializeStorage(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri) {
    try {
      mongoClient = new MongoClient(mongoUri);
      await mongoClient.connect();
      const db = mongoClient.db("smart_delivery");
      storage = new DbStorage(db);
      await (storage as DbStorage).seedIfEmpty();
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("MongoDB connection failed, falling back to in-memory storage:", error);
      storage = new MemStorage();
    }
  } else {
    storage = new MemStorage();
  }
}
