import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Radio,
  Download,
  RefreshCw,
  Activity,
  Thermometer,
  Fuel,
  Zap,
  MapPin,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import type { IotSensorData } from "@shared/schema";

export default function IoTPage() {
  const { toast } = useToast();
  const [selectedSensor, setSelectedSensor] = useState<IotSensorData | null>(null);
  const [alertThresholds, setAlertThresholds] = useState({
    fuel: 20,
    temp: 45,
    speed: 80,
  });

  const { data: sensorData, isLoading, refetch } = useQuery<IotSensorData[]>({
    queryKey: ["/api/iot/sensors"],
    refetchInterval: 5000,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["/api/vehicles"],
  });

  const createAlertMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSensor) return;
      return apiRequest("POST", "/api/alerts", {
        type: "sensor",
        severity: "warning",
        message: `Alert set for sensor ${selectedSensor.deviceId}: Fuel < ${alertThresholds.fuel}%, Temp > ${alertThresholds.temp}°C, Speed > ${alertThresholds.speed} km/h`,
        vehicleId: selectedSensor.vehicleId,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Alert thresholds set successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      setSelectedSensor(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to set alert.",
        variant: "destructive",
      });
    },
  });

  const getConnectionStatus = (status: string) => {
    switch (status) {
      case "connected":
        return { variant: "default" as const, color: "bg-green-500" };
      case "disconnected":
        return { variant: "destructive" as const, color: "bg-red-500" };
      case "unstable":
        return { variant: "secondary" as const, color: "bg-yellow-500" };
      default:
        return { variant: "secondary" as const, color: "bg-gray-400" };
    }
  };

  const getEngineStatus = (status: string) => {
    switch (status) {
      case "running":
        return { variant: "default" as const, text: "Running" };
      case "idle":
        return { variant: "secondary" as const, text: "Idle" };
      case "off":
        return { variant: "secondary" as const, text: "Off" };
      default:
        return { variant: "secondary" as const, text: status };
    }
  };

  const getVehicleInfo = (vehicleId: string) => {
    return (vehicles as any[]).find((v) => v.id === vehicleId);
  };

  const handleViewRoute = () => {
    if (!selectedSensor) return;
    const vehicle = getVehicleInfo(selectedSensor.vehicleId);
    if (vehicle) {
      window.location.href = `/map`;
      toast({
        title: "Redirecting",
        description: `Opening map with vehicle ${vehicle.vehicleNumber}`,
      });
    }
  };

  return (
    <div className="space-y-6" data-testid="page-iot">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">IoT Sensor Data</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time telemetry from vehicle sensors - Click on any row for details
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live Updates
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            data-testid="button-refresh-sensors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            data-testid="button-export-data"
            onClick={() => {
              const csv = (sensorData || [])
                .map(
                  (s) =>
                    `${s.deviceId},${s.vehicleId},${s.latitude},${s.longitude},${s.speed},${s.fuelLevel},${s.temperature || 0}`
                )
                .join("\n");
              const blob = new Blob([csv || ""], { type: "text/csv" });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `iot-sensors-${Date.now()}.csv`;
              a.click();
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Active Sensors
                </p>
                <h3 className="text-3xl font-bold mt-2">{sensorData?.length ?? 0}</h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                <Radio className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Avg Speed
                </p>
                <h3 className="text-3xl font-bold mt-2">
                  {sensorData
                    ? Math.round(
                        sensorData.reduce((acc, s) => acc + s.speed, 0) /
                          sensorData.length
                      )
                    : 0}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">km/h</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                <Activity className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Avg Fuel
                </p>
                <h3 className="text-3xl font-bold mt-2">
                  {sensorData
                    ? Math.round(
                        sensorData.reduce((acc, s) => acc + s.fuelLevel, 0) /
                          sensorData.length
                      )
                    : 0}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">%</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                <Fuel className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Avg Temp
                </p>
                <h3 className="text-3xl font-bold mt-2">
                  {sensorData
                    ? Math.round(
                        sensorData.reduce((acc, s) => acc + (s.temperature ?? 0), 0) /
                          sensorData.length
                      )
                    : 0}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">°C</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                <Thermometer className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Sensor Readings</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 animate-pulse bg-muted rounded" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device ID</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>GPS Location</TableHead>
                    <TableHead>Speed</TableHead>
                    <TableHead>Fuel</TableHead>
                    <TableHead>Temp</TableHead>
                    <TableHead>Engine</TableHead>
                    <TableHead>Connection</TableHead>
                    <TableHead>Last Update</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sensorData && sensorData.length > 0 ? (
                    sensorData.map((sensor) => {
                      const connectionStatus = getConnectionStatus(sensor.connectionStatus);
                      const engineStatus = getEngineStatus(sensor.engineStatus);

                      return (
                        <TableRow
                          key={sensor.id}
                          className="hover-elevate cursor-pointer"
                          data-testid={`sensor-row-${sensor.id}`}
                          onClick={() => setSelectedSensor(sensor)}
                        >
                          <TableCell className="font-mono text-sm">{sensor.deviceId}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {sensor.vehicleId.slice(0, 8)}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {sensor.latitude.toFixed(4)}, {sensor.longitude.toFixed(4)}
                          </TableCell>
                          <TableCell className="font-mono">{sensor.speed} km/h</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    sensor.fuelLevel > 50
                                      ? "bg-green-500"
                                      : sensor.fuelLevel > 20
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                  }`}
                                  style={{ width: `${sensor.fuelLevel}%` }}
                                />
                              </div>
                              <span className="font-mono text-xs w-10">{sensor.fuelLevel}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono">
                            {sensor.temperature ? `${sensor.temperature}°C` : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={engineStatus.variant} className="text-xs">
                              {engineStatus.text}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${connectionStatus.color}`} />
                              <Badge variant={connectionStatus.variant} className="text-xs">
                                {sensor.connectionStatus}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {new Date(sensor.timestamp).toLocaleTimeString()}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12">
                        <Radio className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">No sensor data available</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sensor Details Modal */}
      <Dialog open={!!selectedSensor} onOpenChange={() => setSelectedSensor(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Sensor Details - {selectedSensor?.deviceId}
            </DialogTitle>
            <DialogDescription>
              Vehicle: {getVehicleInfo(selectedSensor?.vehicleId || "")?.vehicleNumber || "N/A"}
            </DialogDescription>
          </DialogHeader>

          {selectedSensor && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" data-testid="tab-sensor-overview">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="route" data-testid="tab-sensor-route">
                  <MapPin className="h-4 w-4 mr-2" />
                  Route
                </TabsTrigger>
                <TabsTrigger value="alerts" data-testid="tab-sensor-alerts">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Alerts
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Device ID</p>
                    <p className="font-mono font-medium">{selectedSensor.deviceId}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Vehicle ID</p>
                    <p className="font-mono font-medium">{selectedSensor.vehicleId}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Location (GPS)</p>
                    <p className="font-mono font-medium">
                      {selectedSensor.latitude.toFixed(6)}, {selectedSensor.longitude.toFixed(6)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Last Update</p>
                    <p className="font-medium">{new Date(selectedSensor.timestamp).toLocaleString()}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Live Sensor Readings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Activity className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-xs text-muted-foreground">Speed</p>
                            <p className="text-2xl font-bold">{selectedSensor.speed}</p>
                            <p className="text-xs text-muted-foreground">km/h</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Fuel className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-xs text-muted-foreground">Fuel Level</p>
                            <p className="text-2xl font-bold">{selectedSensor.fuelLevel}%</p>
                            <div className="w-full bg-muted rounded-full h-1 mt-1">
                              <div
                                className={`h-full rounded-full ${
                                  selectedSensor.fuelLevel > 50
                                    ? "bg-green-500"
                                    : selectedSensor.fuelLevel > 20
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                                style={{ width: `${selectedSensor.fuelLevel}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Thermometer className="h-5 w-5 text-orange-500" />
                          <div>
                            <p className="text-xs text-muted-foreground">Temperature</p>
                            <p className="text-2xl font-bold">
                              {selectedSensor.temperature || "-"}
                            </p>
                            <p className="text-xs text-muted-foreground">°C</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Zap className="h-5 w-5 text-purple-500" />
                          <div>
                            <p className="text-xs text-muted-foreground">Engine Status</p>
                            <Badge
                              variant={
                                selectedSensor.engineStatus === "running"
                                  ? "default"
                                  : "secondary"
                              }
                              className="mt-1"
                            >
                              {selectedSensor.engineStatus}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Route Tab */}
              <TabsContent value="route" className="space-y-4">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    View this vehicle's route and delivery locations on the interactive map.
                  </p>
                  <div className="bg-muted p-4 rounded-md">
                    <p className="font-mono text-sm mb-3">
                      Current Location: {selectedSensor.latitude.toFixed(4)}°N,{" "}
                      {selectedSensor.longitude.toFixed(4)}°E
                    </p>
                    <Button
                      className="w-full"
                      data-testid="button-view-route-on-map"
                      onClick={handleViewRoute}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      View Route on Map
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Clicking the button above will take you to the Live Map where you can see this
                    vehicle's assigned route, delivery points, and real-time movement.
                  </p>
                </div>
              </TabsContent>

              {/* Alerts Tab */}
              <TabsContent value="alerts" className="space-y-4">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Set threshold alerts for this sensor. You'll be notified when values exceed
                    these limits.
                  </p>

                  <div className="space-y-3 bg-muted p-4 rounded-md">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Fuel className="h-4 w-4 text-green-500" />
                        Fuel Level Alert Threshold (%)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={alertThresholds.fuel}
                        onChange={(e) =>
                          setAlertThresholds({
                            ...alertThresholds,
                            fuel: Number(e.target.value),
                          })
                        }
                        data-testid="input-fuel-threshold"
                        placeholder="Alert when fuel drops below..."
                      />
                      <p className="text-xs text-muted-foreground">
                        Current: {selectedSensor.fuelLevel}% - Alert if &lt; {alertThresholds.fuel}%
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-orange-500" />
                        Temperature Alert Threshold (°C)
                      </label>
                      <Input
                        type="number"
                        value={alertThresholds.temp}
                        onChange={(e) =>
                          setAlertThresholds({
                            ...alertThresholds,
                            temp: Number(e.target.value),
                          })
                        }
                        data-testid="input-temp-threshold"
                        placeholder="Alert when temperature exceeds..."
                      />
                      <p className="text-xs text-muted-foreground">
                        Current: {selectedSensor.temperature || "-"}°C - Alert if &gt;{" "}
                        {alertThresholds.temp}°C
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        Speed Alert Threshold (km/h)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={alertThresholds.speed}
                        onChange={(e) =>
                          setAlertThresholds({
                            ...alertThresholds,
                            speed: Number(e.target.value),
                          })
                        }
                        data-testid="input-speed-threshold"
                        placeholder="Alert when speed exceeds..."
                      />
                      <p className="text-xs text-muted-foreground">
                        Current: {selectedSensor.speed} km/h - Alert if &gt; {alertThresholds.speed}
                        km/h
                      </p>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    data-testid="button-set-alert"
                    onClick={() => createAlertMutation.mutate()}
                    disabled={createAlertMutation.isPending}
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {createAlertMutation.isPending ? "Setting Alert..." : "Set Alert Thresholds"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
