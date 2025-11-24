import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AddVehicleDialog } from "@/components/dialogs/add-vehicle-dialog";
import { Truck, Fuel, Gauge, MapPin, Activity, Trash2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Vehicle } from "@shared/schema";
import { formatIST } from "@/lib/format-time";

export default function VehiclesPage() {
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  const { toast } = useToast();
  const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: async (vehicleId: string) => {
      return apiRequest("DELETE", `/api/vehicles/${vehicleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      toast({ title: "Vehicle deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete vehicle", variant: "destructive" });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-transit":
        return "default";
      case "idle":
        return "secondary";
      case "maintenance":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case "in-transit":
        return "bg-blue-500";
      case "idle":
        return "bg-gray-400";
      case "maintenance":
        return "bg-red-500";
      default:
        return "bg-green-500";
    }
  };

  const getFuelColor = (level: number) => {
    if (level > 50) return "bg-green-500";
    if (level > 20) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6" data-testid="page-vehicles">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Vehicle Tracking</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor all vehicles and their real-time telemetry
          </p>
        </div>
        <Button data-testid="button-add-vehicle" onClick={() => setAddVehicleOpen(true)}>
          <Truck className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-32 animate-pulse bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vehicles && vehicles.length > 0 ? (
            vehicles.map((vehicle) => (
              <Card key={vehicle.id} className="hover-elevate" data-testid={`vehicle-card-${vehicle.id}`}>
                <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${getStatusDotColor(vehicle.status)}`} />
                    <div>
                      <CardTitle className="text-base font-medium">
                        {vehicle.vehicleNumber}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {vehicle.driverName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(vehicle.status)} className="text-xs">
                      {vehicle.status}
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteVehicleMutation.mutate(vehicle.id)}
                      disabled={deleteVehicleMutation.isPending}
                      data-testid={`button-delete-vehicle-${vehicle.id}`}
                      className="h-6 w-6"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Gauge className="h-3.5 w-3.5" />
                        <span className="text-xs">Speed</span>
                      </div>
                      <p className="text-sm font-mono font-medium">
                        {vehicle.speed} km/h
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Activity className="h-3.5 w-3.5" />
                        <span className="text-xs">Route</span>
                      </div>
                      <p className="text-sm font-medium">
                        {vehicle.routeCompletion}%
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Fuel className="h-3.5 w-3.5" />
                        <span>Fuel Level</span>
                      </div>
                      <span className="font-mono font-medium">{vehicle.fuelLevel}%</span>
                    </div>
                    <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full ${getFuelColor(vehicle.fuelLevel)} transition-all`}
                        style={{ width: `${vehicle.fuelLevel}%` }}
                      />
                    </div>
                  </div>

                  {vehicle.routeCompletion > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Route Progress</span>
                        <span className="font-mono font-medium">{vehicle.routeCompletion}%</span>
                      </div>
                      <Progress value={vehicle.routeCompletion} className="h-2" />
                    </div>
                  )}

                  <div className="pt-2 border-t space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="text-xs">GPS Location</span>
                    </div>
                    <p className="text-xs font-mono">
                      {vehicle.latitude.toFixed(6)}, {vehicle.longitude.toFixed(6)}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      Last update: {formatIST(vehicle.lastUpdate)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <Truck className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No vehicles found</p>
            </div>
          )}
        </div>
      )}
      <AddVehicleDialog open={addVehicleOpen} onOpenChange={setAddVehicleOpen} />
    </div>
  );
}
