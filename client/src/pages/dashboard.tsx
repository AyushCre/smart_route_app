import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { MetricsCard } from "@/components/metrics-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Activity,
  TrendingUp,
} from "lucide-react";
import type { DashboardMetrics, Alert, Vehicle } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/metrics"],
  });

  const { data: recentAlerts, isLoading: alertsLoading } = useQuery<Alert[]>({
    queryKey: ["/api/alerts", "recent"],
  });

  const { data: activeVehicles, isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles", "active"],
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "warning":
        return "default";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-transit":
        return "bg-blue-500";
      case "idle":
        return "bg-gray-400";
      case "maintenance":
        return "bg-yellow-500";
      default:
        return "bg-green-500";
    }
  };

  return (
    <div className="space-y-6" data-testid="page-dashboard">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time overview of your delivery operations
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metricsLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-20 animate-pulse bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <MetricsCard
              title="Active Deliveries"
              value={metrics?.activeDeliveries ?? 0}
              icon={Package}
              trend={{ value: 12, isPositive: true }}
            />
            <MetricsCard
              title="Active Vehicles"
              value={metrics?.activeVehicles ?? 0}
              icon={Truck}
            />
            <MetricsCard
              title="Completed Today"
              value={metrics?.completedToday ?? 0}
              icon={CheckCircle}
              trend={{ value: 8, isPositive: true }}
            />
            <MetricsCard
              title="On-Time Rate"
              value={`${metrics?.onTimePercentage ?? 0}%`}
              icon={Clock}
              trend={{ value: 3, isPositive: true }}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Recent Alerts</CardTitle>
            <Button variant="ghost" size="sm" data-testid="button-view-all-alerts" onClick={() => setLocation("/alerts")}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {alertsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse bg-muted rounded" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {recentAlerts && recentAlerts.length > 0 ? (
                  recentAlerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-3 rounded-md border p-3 hover-elevate"
                      data-testid={`alert-${alert.id}`}
                    >
                      <AlertTriangle
                        className={`h-5 w-5 mt-0.5 ${
                          alert.severity === "critical"
                            ? "text-red-600"
                            : alert.severity === "warning"
                            ? "text-yellow-600"
                            : "text-blue-600"
                        }`}
                      />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityColor(alert.severity)} className="text-xs">
                            {alert.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-mono">
                            {new Date(alert.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent alerts</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Active Vehicles</CardTitle>
            <Button variant="ghost" size="sm" data-testid="button-view-all-vehicles" onClick={() => setLocation("/vehicles")}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {vehiclesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse bg-muted rounded" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {activeVehicles && activeVehicles.length > 0 ? (
                  activeVehicles.slice(0, 5).map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="flex items-center gap-3 rounded-md border p-3 hover-elevate"
                      data-testid={`vehicle-${vehicle.id}`}
                    >
                      <div className={`h-3 w-3 rounded-full ${getStatusColor(vehicle.status)}`} />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{vehicle.vehicleNumber}</p>
                          <span className="text-xs text-muted-foreground font-mono">
                            {vehicle.speed} km/h
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{vehicle.driverName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Fuel</p>
                        <p className="text-sm font-medium">{vehicle.fuelLevel}%</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Truck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No active vehicles</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Avg Delivery Time"
          value={`${metrics?.averageDeliveryTime ?? 0} min`}
          icon={Activity}
          subtitle="Last 7 days"
        />
        <MetricsCard
          title="Route Efficiency"
          value={`${metrics?.routeEfficiency ?? 0}%`}
          icon={TrendingUp}
          trend={{ value: 5, isPositive: true }}
        />
        <MetricsCard
          title="Total Revenue"
          value={`$${(metrics?.totalRevenue ?? 0).toLocaleString()}`}
          icon={DollarSign}
          subtitle="This month"
        />
        <MetricsCard
          title="Pending Alerts"
          value={metrics?.pendingAlerts ?? 0}
          icon={AlertTriangle}
        />
      </div>
    </div>
  );
}
