import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage, initializeStorage } from "./storage";
import { optimizeRoute, type Coordinate } from "./pathfinding";
import {
  insertVehicleSchema,
  insertDeliverySchema,
  insertRouteSchema,
  insertAlertSchema,
  insertIotSensorDataSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  await initializeStorage();
  app.get("/api/metrics", async (_req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });

  app.get("/api/vehicles", async (req, res) => {
    try {
      let vehicles = await storage.getVehicles();
      
      // Filtering by status
      if (req.query.status) {
        vehicles = vehicles.filter(v => v.status === req.query.status);
      }
      
      // Filtering by vehicle number (search)
      if (req.query.search) {
        vehicles = vehicles.filter(v => 
          v.vehicleNumber.toLowerCase().includes((req.query.search as string).toLowerCase())
        );
      }
      
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });

  app.get("/api/vehicles/active", async (_req, res) => {
    try {
      const vehicles = await storage.getVehicles();
      const active = vehicles.filter(
        (v) => v.status === "in-transit" || v.status === "idle"
      );
      res.json(active);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active vehicles" });
    }
  });

  app.get("/api/vehicles/:id", async (req, res) => {
    try {
      const vehicle = await storage.getVehicle(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicle" });
    }
  });

  app.post("/api/vehicles", async (req, res) => {
    try {
      const validatedData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(validatedData);
      res.status(201).json(vehicle);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid vehicle data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create vehicle" });
    }
  });

  app.patch("/api/vehicles/:id", async (req, res) => {
    try {
      const vehicle = await storage.updateVehicle(req.params.id, req.body);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ error: "Failed to update vehicle" });
    }
  });

  app.get("/api/deliveries", async (req, res) => {
    try {
      let deliveries = await storage.getDeliveries();
      
      // Filtering by status
      if (req.query.status) {
        deliveries = deliveries.filter(d => d.status === req.query.status);
      }
      
      // Filtering by priority
      if (req.query.priority) {
        deliveries = deliveries.filter(d => d.priority === req.query.priority);
      }
      
      // Filtering by customer name (search)
      if (req.query.search) {
        deliveries = deliveries.filter(d => 
          d.customerName.toLowerCase().includes((req.query.search as string).toLowerCase()) ||
          d.orderId.toLowerCase().includes((req.query.search as string).toLowerCase())
        );
      }
      
      res.json(deliveries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch deliveries" });
    }
  });

  app.get("/api/deliveries/active", async (_req, res) => {
    try {
      const deliveries = await storage.getDeliveries();
      const active = deliveries.filter(
        (d) => d.status === "in-transit" || d.status === "pending"
      );
      res.json(active);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active deliveries" });
    }
  });

  app.get("/api/deliveries/:id", async (req, res) => {
    try {
      const delivery = await storage.getDelivery(req.params.id);
      if (!delivery) {
        return res.status(404).json({ error: "Delivery not found" });
      }
      res.json(delivery);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch delivery" });
    }
  });

  app.post("/api/deliveries", async (req, res) => {
    try {
      const validatedData = insertDeliverySchema.parse(req.body);
      const delivery = await storage.createDelivery(validatedData);
      res.status(201).json(delivery);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid delivery data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create delivery" });
    }
  });

  app.patch("/api/deliveries/:id", async (req, res) => {
    try {
      const delivery = await storage.updateDelivery(req.params.id, req.body);
      if (!delivery) {
        return res.status(404).json({ error: "Delivery not found" });
      }
      res.json(delivery);
    } catch (error) {
      res.status(500).json({ error: "Failed to update delivery" });
    }
  });

  app.get("/api/routes", async (req, res) => {
    try {
      let routes = await storage.getRoutes();
      
      // Filtering by status
      if (req.query.status) {
        routes = routes.filter(r => r.status === req.query.status);
      }
      
      // Filtering by algorithm
      if (req.query.algorithm) {
        routes = routes.filter(r => r.algorithm === req.query.algorithm);
      }
      
      // Filtering by route name (search)
      if (req.query.search) {
        routes = routes.filter(r => 
          r.name.toLowerCase().includes((req.query.search as string).toLowerCase())
        );
      }
      
      res.json(routes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch routes" });
    }
  });

  app.get("/api/routes/active", async (_req, res) => {
    try {
      const routes = await storage.getRoutes();
      const active = routes.filter((r) => r.status === "active");
      res.json(active);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active routes" });
    }
  });

  app.get("/api/routes/:id", async (req, res) => {
    try {
      const route = await storage.getRoute(req.params.id);
      if (!route) {
        return res.status(404).json({ error: "Route not found" });
      }
      res.json(route);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch route" });
    }
  });

  app.post("/api/routes", async (req, res) => {
    try {
      const validatedData = insertRouteSchema.parse(req.body);
      const route = await storage.createRoute(validatedData);
      res.status(201).json(route);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid route data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create route" });
    }
  });

  app.patch("/api/routes/:id", async (req, res) => {
    try {
      const route = await storage.updateRoute(req.params.id, req.body);
      if (!route) {
        return res.status(404).json({ error: "Route not found" });
      }
      res.json(route);
    } catch (error) {
      res.status(500).json({ error: "Failed to update route" });
    }
  });

  app.post("/api/routes/optimize", async (req, res) => {
    try {
      const { waypoints, algorithm } = req.body;
      if (!waypoints || !Array.isArray(waypoints)) {
        return res.status(400).json({ error: "Waypoints array is required" });
      }
      
      const coordinates: Coordinate[] = waypoints.map((w: any) => ({
        lat: w.lat || w.latitude,
        lng: w.lng || w.longitude,
        address: w.address,
      }));

      const optimization = optimizeRoute(
        coordinates,
        (algorithm || "dijkstra") as "dijkstra" | "astar"
      );

      res.json(optimization);
    } catch (error) {
      res.status(500).json({ error: "Failed to optimize route" });
    }
  });

  app.get("/api/alerts", async (_req, res) => {
    try {
      const alerts = await storage.getAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  app.get("/api/alerts/recent", async (_req, res) => {
    try {
      const alerts = await storage.getAlerts();
      res.json(alerts.slice(0, 5));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent alerts" });
    }
  });

  app.get("/api/alerts/:id", async (req, res) => {
    try {
      const alert = await storage.getAlert(req.params.id);
      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }
      res.json(alert);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch alert" });
    }
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      const validatedData = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(validatedData);
      res.status(201).json(alert);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid alert data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create alert" });
    }
  });

  app.patch("/api/alerts/:id/read", async (req, res) => {
    try {
      await storage.markAlertAsRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark alert as read" });
    }
  });

  app.get("/api/iot/sensors", async (_req, res) => {
    try {
      const sensorData = await storage.getIotSensorData();
      res.json(sensorData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch IoT sensor data" });
    }
  });

  app.post("/api/iot/sensors", async (req, res) => {
    try {
      const validatedData = insertIotSensorDataSchema.parse(req.body);
      const sensorData = await storage.createIotSensorData(validatedData);
      res.status(201).json(sensorData);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid sensor data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create IoT sensor data" });
    }
  });

  const httpServer = createServer(app);

  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws: WebSocket) => {
    console.log("WebSocket client connected");

    const sendVehicleUpdates = async () => {
      const vehicles = await storage.getVehicles();
      
      for (const vehicle of vehicles) {
        if (vehicle.status === "in-transit") {
          const latChange = (Math.random() - 0.5) * 0.001;
          const lngChange = (Math.random() - 0.5) * 0.001;
          const speedChange = (Math.random() - 0.5) * 5;
          
          await storage.updateVehicle(vehicle.id, {
            latitude: vehicle.latitude + latChange,
            longitude: vehicle.longitude + lngChange,
            speed: Math.max(0, Math.min(80, vehicle.speed + speedChange)),
            fuelLevel: Math.max(0, vehicle.fuelLevel - Math.random() * 0.5),
          });

          const updatedVehicle = await storage.getVehicle(vehicle.id);
          if (updatedVehicle && ws.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({
                type: "vehicle_update",
                data: updatedVehicle,
              })
            );
          }
        }
      }
    };

    const updateInterval = setInterval(sendVehicleUpdates, 5000);

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
      clearInterval(updateInterval);
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      clearInterval(updateInterval);
    });
  });

  return httpServer;
}
