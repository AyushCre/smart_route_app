import { useQuery } from "@tanstack/react-query";
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
import { Radio, Download, RefreshCw, Activity, Thermometer, Fuel, Zap } from "lucide-react";
import type { IotSensorData } from "@shared/schema";

export default function IoTPage() {
  const { data: sensorData, isLoading, refetch } = useQuery<IotSensorData[]>({
    queryKey: ["/api/iot/sensors"],
    refetchInterval: 5000,
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

  return (
    <div className="space-y-6" data-testid="page-iot">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">IoT Sensor Data</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time telemetry from vehicle sensors
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
          <Button variant="outline" size="sm" data-testid="button-export-data">
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
                        sensorData.reduce((acc, s) => acc + s.speed, 0) / sensorData.length
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
                        sensorData.reduce((acc, s) => acc + s.fuelLevel, 0) / sensorData.length
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
                          className="hover-elevate"
                          data-testid={`sensor-row-${sensor.id}`}
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
    </div>
  );
}
