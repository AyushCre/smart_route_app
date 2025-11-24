import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Navigation, Phone, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatIST } from "@/lib/format-time";

interface Vehicle {
  id: string;
  vehicleNumber: string;
  driverName: string;
  latitude: number;
  longitude: number;
  speed: number;
  fuelLevel: number;
  status: string;
  currentRouteId: string | null;
  routeCompletion: number;
}

interface GpsCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

const VEHICLE_ID = "driver-vehicle-default"; // Default vehicle ID for driver

export default function DriverView() {
  const [isTracking, setIsTracking] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<GpsCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  // Fetch all vehicles
  const { data: vehicles = [] } = useQuery({
    queryKey: ["/api/vehicles"],
    refetchInterval: 5000,
  });

  // Set first vehicle as default if not already selected
  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId((vehicles as Vehicle[])[0].id);
    }
  }, [vehicles, selectedVehicleId]);

  const currentVehicle = (vehicles as Vehicle[])?.find(
    (v) => v.id === selectedVehicleId
  );

  // Mutation to update vehicle location from GPS
  const updateLocationMutation = useMutation({
    mutationFn: async (coords: GpsCoordinates) => {
      if (!currentVehicle) return;
      
      return apiRequest("PATCH", `/api/vehicles/${currentVehicle.id}`, {
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
    },
  });

  // Start GPS tracking
  const startTracking = () => {
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    // Request high-accuracy GPS
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const coords: GpsCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };

        setGpsCoords(coords);
        setError(null);

        // Update vehicle location in real-time
        updateLocationMutation.mutate(coords);
      },
      (err) => {
        let errorMsg = "Unable to retrieve GPS location";

        if (err.code === 1) {
          errorMsg = "Permission denied. Please allow location access.";
        } else if (err.code === 2) {
          errorMsg = "Position unavailable. Check your GPS signal.";
        } else if (err.code === 3) {
          errorMsg = "Request timeout. Please try again.";
        }

        setError(errorMsg);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    setWatchId(id);
    setIsTracking(true);
  };

  // Stop GPS tracking
  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
  };

  useEffect(() => {
    return () => {
      // Cleanup: stop tracking when component unmounts
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  if (!currentVehicle) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              No Vehicle Assigned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Please contact your dispatcher to assign a vehicle to this driver account.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 p-4 md:p-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Driver View</h1>
        <p className="text-muted-foreground">Real-time GPS tracking for deliveries</p>
      </div>

      {/* Vehicle Selector */}
      {vehicles && vehicles.length > 0 && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Select Vehicle:</label>
          <Select value={selectedVehicleId || ""} onValueChange={setSelectedVehicleId}>
            <SelectTrigger className="w-full" data-testid="select-driver-vehicle">
              <SelectValue placeholder="Choose a vehicle" />
            </SelectTrigger>
            <SelectContent>
              {(vehicles as Vehicle[]).map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.vehicleNumber} - {vehicle.driverName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Vehicle Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{currentVehicle.vehicleNumber}</span>
            <Badge variant={currentVehicle.status === "in-transit" ? "default" : "secondary"}>
              {currentVehicle.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Driver</p>
            <p className="text-lg">{currentVehicle.driverName}</p>
          </div>

          {currentVehicle.currentRouteId && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Route Progress</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${currentVehicle.routeCompletion}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{Math.round(currentVehicle.routeCompletion)}%</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div>
              <p className="text-xs text-muted-foreground">Speed</p>
              <p className="text-lg font-semibold">{currentVehicle.speed} km/h</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fuel Level</p>
              <p className="text-lg font-semibold">{Math.round(currentVehicle.fuelLevel)}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-lg font-semibold capitalize">{currentVehicle.status}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GPS Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            GPS Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200 rounded-md flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {gpsCoords && (
            <div className="space-y-3 p-3 bg-green-50 dark:bg-green-950 rounded-md">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <CheckCircle2 className="w-4 h-4" />
                <p className="text-sm font-medium">GPS Connected</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-green-700 dark:text-green-300">Latitude</p>
                  <p className="font-mono text-green-900 dark:text-green-100">{gpsCoords.latitude.toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-green-700 dark:text-green-300">Longitude</p>
                  <p className="font-mono text-green-900 dark:text-green-100">{gpsCoords.longitude.toFixed(6)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-green-700 dark:text-green-300">Accuracy</p>
                  <p className="font-mono text-green-900 dark:text-green-100">±{Math.round(gpsCoords.accuracy)} meters</p>
                </div>
              </div>
            </div>
          )}

          {!isTracking && (
            <div className="text-center text-sm text-muted-foreground">
              {gpsCoords ? "GPS paused" : "GPS not started"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Location Display */}
      {gpsCoords && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Current Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Your real-time location is being sent to the dashboard every few seconds.
              </p>
              <div className="p-3 bg-muted rounded-md font-mono text-xs break-all">
                {gpsCoords.latitude.toFixed(6)}, {gpsCoords.longitude.toFixed(6)}
              </div>
              <p className="text-xs text-muted-foreground">
                Last updated: {formatIST(new Date(gpsCoords.timestamp))}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Control Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={startTracking}
          disabled={isTracking}
          size="lg"
          className="flex-1"
          data-testid="button-start-driving"
        >
          <Navigation className="w-4 h-4 mr-2" />
          Start Driving
        </Button>
        <Button
          onClick={stopTracking}
          disabled={!isTracking}
          variant="outline"
          size="lg"
          className="flex-1"
          data-testid="button-stop-driving"
        >
          <Phone className="w-4 h-4 mr-2" />
          Stop Tracking
        </Button>
      </div>

      {/* Info Box */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>How it works:</strong> When you click "Start Driving", your phone's GPS will be used to
            track your real-time location. Your dispatcher can see your location on the dashboard map in
            real-time. Make sure location permissions are enabled for your browser.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
