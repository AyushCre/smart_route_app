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

// Track vehicle progress - declared here so it persists across requests
const vehicleProgress: Map<string, number> = new Map();
const routeSpeeds: Map<string, number> = new Map();
let lastLoggedCount = 0;

// Helper to reset progress when assigning new routes
const resetVehicleProgress = (vehicleId: string) => {
  vehicleProgress.delete(vehicleId);
};

// Helper to get/create speed for a destination
const getSpeedForDestination = (destinationKey: string): number => {
  if (routeSpeeds.has(destinationKey)) {
    return routeSpeeds.get(destinationKey)!;
  }
  const speed = 30 + Math.random() * 30;
  routeSpeeds.set(destinationKey, Math.round(speed));
  return Math.round(speed);
};

export async function registerRoutes(app: Express): Promise<Server> {
  await initializeStorage();

  // Auto-optimize routes on startup to start vehicle movement immediately
  setTimeout(async () => {
    try {
      const deliveries = await storage.getDeliveries();
      const vehicles = await storage.getVehicles();
      const pendingDeliveries = deliveries.filter((d) => d.status === "pending");

      if (pendingDeliveries.length > 0 && vehicles.length > 0) {
        console.log(`Starting up: Optimizing ${pendingDeliveries.length} pending deliveries with ${vehicles.length} vehicles...`);
        
        const createdRoutes = [];

        for (let i = 0; i < vehicles.length && i < pendingDeliveries.length; i++) {
          const vehicle = vehicles[i];
          const batchSize = Math.ceil(pendingDeliveries.length / vehicles.length);
          const start = i * batchSize;
          const end = Math.min(start + batchSize, pendingDeliveries.length);
          const assignedDeliveries = pendingDeliveries.slice(start, end);

          if (assignedDeliveries.length === 0) continue;

          const waypoints: Coordinate[] = [
            {
              lat: vehicle.latitude,
              lng: vehicle.longitude,
              address: `Vehicle Start (${vehicle.vehicleNumber})`,
            },
            ...assignedDeliveries.map((d) => ({
              lat: d.deliveryLat,
              lng: d.deliveryLng,
              address: d.deliveryAddress,
            })),
          ];

          const optimization = optimizeRoute(waypoints, "dijkstra");

          const route = await storage.createRoute({
            name: `Route-${vehicle.vehicleNumber}-${Date.now()}`,
            vehicleId: vehicle._id,
            algorithm: "dijkstra",
            status: "active",
            totalDistance: optimization.totalDistance,
            estimatedDuration: optimization.estimatedDuration,
            estimatedCost: optimization.totalDistance * 0.5,
            waypoints: JSON.stringify(waypoints),
            pathCoordinates: JSON.stringify(optimization.coordinates),
          });

          for (const d of assignedDeliveries) {
            await storage.updateDelivery(d._id, {
              status: "in-transit",
              vehicleId: vehicle._id,
              routeId: route._id,
            });
          }

          // Reset vehicle progress when assigning new route
          resetVehicleProgress(vehicle._id);

          await storage.updateVehicle(vehicle._id, {
            status: "in-transit",
            currentRouteId: route._id,
            routeCompletion: 0,
          });

          createdRoutes.push(route);
        }

        console.log(`Startup: Created ${createdRoutes.length} routes. Vehicles will start moving!`);
      }
    } catch (err) {
      console.error("Startup auto-optimization error:", err);
    }
  }, 500);

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

  app.delete("/api/vehicles/:id", async (req, res) => {
    try {
      await storage.deleteVehicle(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete vehicle" });
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
      let data = { ...req.body };
      
      // Set default dates if not provided or empty
      const now = Date.now();
      if (!data.scheduledTime || data.scheduledTime === "") {
        data.scheduledTime = new Date(now + 3600000); // 1 hour from now
      }
      if (!data.estimatedDeliveryTime || data.estimatedDeliveryTime === "") {
        data.estimatedDeliveryTime = new Date(now + 7200000); // 2 hours from now
      }
      
      console.log("Creating delivery with dates:", { 
        scheduledTime: data.scheduledTime, 
        estimatedDeliveryTime: data.estimatedDeliveryTime 
      });
      
      const validatedData = insertDeliverySchema.parse(data);
      const delivery = await storage.createDelivery(validatedData);
      
      console.log("Delivery created successfully:", { 
        orderId: delivery.orderId, 
        status: delivery.status,
        scheduledTime: delivery.scheduledTime,
        estimatedDeliveryTime: delivery.estimatedDeliveryTime
      });
      
      // Auto-optimize routes to make vehicles move immediately
      setTimeout(async () => {
        try {
          const deliveries = await storage.getDeliveries();
          const vehicles = await storage.getVehicles();
          const pendingDeliveries = deliveries.filter((d) => d.status === "pending");

          if (pendingDeliveries.length > 0 && vehicles.length > 0) {
            const createdRoutes = [];

            for (let i = 0; i < vehicles.length && i < pendingDeliveries.length; i++) {
              const vehicle = vehicles[i];
              const batchSize = Math.ceil(pendingDeliveries.length / vehicles.length);
              const start = i * batchSize;
              const end = Math.min(start + batchSize, pendingDeliveries.length);
              const assignedDeliveries = pendingDeliveries.slice(start, end);

              if (assignedDeliveries.length === 0) continue;

              const waypoints: Coordinate[] = [
                {
                  lat: vehicle.latitude,
                  lng: vehicle.longitude,
                  address: `Vehicle Start (${vehicle.vehicleNumber})`,
                },
                ...assignedDeliveries.map((d) => ({
                  lat: d.deliveryLat,
                  lng: d.deliveryLng,
                  address: d.deliveryAddress,
                })),
              ];

              const optimization = optimizeRoute(waypoints, "dijkstra");

              const route = await storage.createRoute({
                name: `Route-${vehicle.vehicleNumber}-${Date.now()}`,
                vehicleId: vehicle._id,
                algorithm: "dijkstra",
                status: "active",
                totalDistance: optimization.totalDistance,
                estimatedDuration: optimization.estimatedDuration,
                estimatedCost: optimization.totalDistance * 0.5,
                waypoints: JSON.stringify(waypoints),
                pathCoordinates: JSON.stringify(optimization.coordinates),
              });

              for (const d of assignedDeliveries) {
                await storage.updateDelivery(d._id, {
                  status: "in-transit",
                  vehicleId: vehicle._id,
                  routeId: route._id,
                });
              }

              await storage.updateVehicle(vehicle._id, {
                status: "in-transit",
                currentRouteId: route._id,
                routeCompletion: 0,
              });

              createdRoutes.push(route);
            }

            console.log(`Auto-optimized ${createdRoutes.length} routes after delivery creation`);
          }
        } catch (err) {
          console.error("Auto-optimization error:", err);
        }
      }, 100);
      
      res.status(201).json(delivery);
    } catch (error: any) {
      console.error("Delivery creation error details:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid delivery data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create delivery", details: error.message });
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

  app.delete("/api/deliveries/:id", async (req, res) => {
    try {
      await storage.deleteDelivery(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete delivery" });
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

  // Diagnostic: Check optimization readiness (MUST be before :id route)
  app.get("/api/routes/status", async (_req, res) => {
    try {
      const deliveries = await storage.getDeliveries();
      const vehicles = await storage.getVehicles();
      const routes = await storage.getRoutes();
      
      const pending = deliveries.filter(d => d.status === "pending").length;
      const inTransit = deliveries.filter(d => d.status === "in-transit").length;
      const delivered = deliveries.filter(d => d.status === "delivered").length;
      
      res.json({
        deliveries: {
          total: deliveries.length,
          pending,
          inTransit,
          delivered,
          other: deliveries.length - pending - inTransit - delivered,
        },
        vehicles: {
          total: vehicles.length,
          idle: vehicles.filter(v => v.status === "idle").length,
          inTransit: vehicles.filter(v => v.status === "in-transit").length,
        },
        routes: routes.length,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get status" });
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

  // Auto-optimize pending deliveries
  app.post("/api/routes/optimize-all", async (req, res) => {
    try {
      const deliveries = await storage.getDeliveries();
      const vehicles = await storage.getVehicles();
      const pendingDeliveries = deliveries.filter((d) => d.status === "pending");

      console.log(`Optimize request: ${deliveries.length} total deliveries, ${pendingDeliveries.length} pending, ${vehicles.length} vehicles`);

      if (pendingDeliveries.length === 0) {
        console.log("No pending deliveries found");
        return res.json({ message: "No pending deliveries", routes: [], deliveriesAssigned: 0 });
      }

      const createdRoutes = [];

      // Simple round-robin assignment: assign pending deliveries to vehicles
      for (let i = 0; i < vehicles.length && i < pendingDeliveries.length; i++) {
        const vehicle = vehicles[i];
        const batchSize = Math.ceil(pendingDeliveries.length / vehicles.length);
        const start = i * batchSize;
        const end = Math.min(start + batchSize, pendingDeliveries.length);
        const assignedDeliveries = pendingDeliveries.slice(start, end);

        if (assignedDeliveries.length === 0) continue;

        // Build waypoints: start from vehicle location, then all delivery points
        const waypoints: Coordinate[] = [
          {
            lat: vehicle.latitude,
            lng: vehicle.longitude,
            address: `Vehicle Start (${vehicle.vehicleNumber})`,
          },
          ...assignedDeliveries.map((d) => ({
            lat: d.deliveryLat,
            lng: d.deliveryLng,
            address: d.deliveryAddress,
          })),
        ];

        // Optimize the route
        const optimization = optimizeRoute(waypoints, "dijkstra");

        // Create the route
        const route = await storage.createRoute({
          name: `Route-${vehicle.vehicleNumber}-${Date.now()}`,
          vehicleId: vehicle._id,
          algorithm: "dijkstra",
          status: "active",
          totalDistance: optimization.totalDistance,
          estimatedDuration: optimization.estimatedDuration,
          estimatedCost: optimization.totalDistance * 0.5, // $0.50 per km
          waypoints: JSON.stringify(waypoints),
          pathCoordinates: JSON.stringify(optimization.coordinates),
        });

        // Update deliveries with route assignment
        for (const delivery of assignedDeliveries) {
          await storage.updateDelivery(delivery._id, {
            status: "in-transit",
            vehicleId: vehicle._id,
            routeId: route._id,
          });
        }

        // Reset vehicle progress to 0 when assigning new route
        resetVehicleProgress(vehicle._id);

        // Update vehicle status
        await storage.updateVehicle(vehicle._id, {
          status: "in-transit",
          currentRouteId: route._id,
          routeCompletion: 0,
        });

        createdRoutes.push(route);
      }

      console.log(`Optimization complete: Created ${createdRoutes.length} routes for ${pendingDeliveries.length} deliveries`);
      res.json({
        message: "Routes optimized successfully",
        routes: createdRoutes,
        deliveriesAssigned: pendingDeliveries.length,
      });
    } catch (error: any) {
      console.error("Route optimization error:", error);
      res.status(500).json({ error: "Failed to optimize routes", details: error.message });
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

  app.patch("/api/alerts/mark-all-read", async (_req, res) => {
    try {
      const alerts = await storage.getAlerts();
      let count = 0;
      for (const alert of alerts) {
        if (!alert.isRead) {
          await storage.markAlertAsRead(alert._id);
          count++;
        }
      }
      res.json({ success: true, count });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark all alerts as read" });
    }
  });

  app.delete("/api/alerts/:id", async (req, res) => {
    try {
      const alert = await storage.getAlert(req.params.id);
      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }
      await storage.deleteAlert(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete alert" });
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

  // Global vehicle update loop - broadcast to ALL connected clients
  const sendVehicleUpdatesToAll = async () => {
    const vehicles = await storage.getVehicles();
    const inTransitCount = vehicles.filter(v => v.status === "in-transit").length;
    
    if (inTransitCount > 0 && inTransitCount !== lastLoggedCount) {
      console.log(`[Movement Loop] Found ${inTransitCount} vehicles in-transit, will move them`);
      lastLoggedCount = inTransitCount;
    }
    
    for (const vehicle of vehicles) {
      if (vehicle.status === "in-transit" && vehicle.currentRouteId) {
        const route = await storage.getRoute(vehicle.currentRouteId);
        if (!route) continue;

        try {
          const pathCoordinates = JSON.parse(route.pathCoordinates) as [number, number][];
          if (pathCoordinates.length < 2) continue;

          // Get current progress (0-1)
          let progress = vehicleProgress.get(vehicle._id) || 0;
          const stepSize = 0.05; // Move 5% along the route per update
          progress = Math.min(1, progress + stepSize);
          vehicleProgress.set(vehicle._id, progress);

          // Calculate current position along path using linear interpolation
          const totalPoints = pathCoordinates.length;
          const currentSegmentIndex = Math.floor(progress * (totalPoints - 1));
          const nextSegmentIndex = Math.min(currentSegmentIndex + 1, totalPoints - 1);
          const segmentProgress = (progress * (totalPoints - 1)) - currentSegmentIndex;

          const [currentLat, currentLng] = pathCoordinates[currentSegmentIndex];
          const [nextLat, nextLng] = pathCoordinates[nextSegmentIndex];

          const newLat = currentLat + (nextLat - currentLat) * segmentProgress;
          const newLng = currentLng + (nextLng - currentLng) * segmentProgress;

          // Get speed based on route destination (same destination = same speed)
          const destinationKey = route._id; // Use route ID as destination key
          const routeSpeed = getSpeedForDestination(destinationKey);
          const speed = progress < 0.9 ? routeSpeed : 0;
          const routeCompletion = progress * 100;

          // Mark route as completed when done (but NOT deliveries - they complete separately)
          let newStatus = "in-transit";
          if (progress >= 1) {
            newStatus = "idle";
            vehicleProgress.delete(vehicle._id);
            routeSpeeds.delete(destinationKey); // Clean up speed for completed route
            
            // Update route status
            await storage.updateRoute(vehicle.currentRouteId, { status: "completed" });
            
            // NOTE: Deliveries are NOT auto-completed when route completes
            // They transition to "delivered" only when manually marked in the system
            // Routes are just the planned paths, deliveries are the actual delivery events
          }

          await storage.updateVehicle(vehicle._id, {
            latitude: newLat,
            longitude: newLng,
            speed: speed,
            status: newStatus,
            routeCompletion: routeCompletion,
            fuelLevel: Math.max(0, vehicle.fuelLevel - Math.random() * 0.3),
          });

          const updatedVehicle = await storage.getVehicle(vehicle._id);
          if (updatedVehicle) {
            // Broadcast to ALL connected clients
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(
                  JSON.stringify({
                    type: "vehicle_update",
                    data: updatedVehicle,
                  })
                );
              }
            });
          }
        } catch (err) {
          console.error("Error updating vehicle position:", err);
        }
      }
    }
  };

  // Start global vehicle update loop every 3 seconds
  setInterval(sendVehicleUpdatesToAll, 3000);

  wss.on("connection", (ws: WebSocket) => {
    console.log("WebSocket client connected");

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  return httpServer;
}
