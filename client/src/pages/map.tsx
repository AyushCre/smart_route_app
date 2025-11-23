import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from "react-leaflet";
import L from "leaflet";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Maximize2, Layers, Navigation } from "lucide-react";
import type { Vehicle, Delivery, Route } from "@shared/schema";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const vehicleIcon = new L.Icon({
  iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232563eb'%3E%3Cpath d='M18 18.5a1.5 1.5 0 0 1-1 1.5 1.5 1.5 0 0 1-1.5-1.5 1.5 1.5 0 0 1 1.5-1.5 1.5 1.5 0 0 1 1 1.5zm1.5-9-1.5-5H6L4.5 9.5H2v8h3a3 3 0 0 0 3 3 3 3 0 0 0 3-3h4a3 3 0 0 0 3 3 3 3 0 0 0 3-3h3v-8zm-17 3v-2h13v2z'/%3E%3C/svg%3E",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const deliveryIcon = new L.Icon({
  iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2316a34a'%3E%3Cpath d='M20 6h-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v2H4c-1.11 0-2 .89-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8c0-1.11-.89-2-2-2M8 4h8v2H8zm9 13l-4-4v3H9v-3l-4 4z'/%3E%3C/svg%3E",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

export default function MapPage() {
  const mapRef = useRef<L.Map>(null);
  const [mapCenter] = useState<[number, number]>([37.7749, -122.4194]);

  const { data: vehicles } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: deliveries } = useQuery<Delivery[]>({
    queryKey: ["/api/deliveries", "active"],
  });

  const { data: routes } = useQuery<Route[]>({
    queryKey: ["/api/routes", "active"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-transit":
        return "bg-blue-500";
      case "pending":
        return "bg-yellow-500";
      case "completed":
        return "bg-green-500";
      case "delayed":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="h-full flex flex-col" data-testid="page-map">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Live Map</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time vehicle tracking and delivery routes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live
          </Badge>
          <Button variant="outline" size="sm" data-testid="button-layers" onClick={() => {
            const mapElement = document.querySelector('.leaflet-container');
            if (mapElement) {
              mapElement.dispatchEvent(new CustomEvent('toggleLayers'));
            }
          }}>
            <Layers className="h-4 w-4 mr-2" />
            Layers
          </Button>
          <Button variant="outline" size="sm" data-testid="button-fullscreen" onClick={() => {
            const mapContainer = document.querySelector('.leaflet-container')?.parentElement;
            if (mapContainer?.requestFullscreen) {
              mapContainer.requestFullscreen();
            }
          }}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 relative rounded-md overflow-hidden border">
        <MapContainer
          center={mapCenter}
          zoom={12}
          scrollWheelZoom={true}
          className="h-full w-full"
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {vehicles?.map((vehicle) => (
            <Marker
              key={vehicle.id}
              position={[vehicle.latitude, vehicle.longitude]}
              icon={vehicleIcon}
            >
              <Popup>
                <Card className="border-0 shadow-none">
                  <CardContent className="p-3 space-y-2">
                    <div>
                      <p className="font-medium text-sm">{vehicle.vehicleNumber}</p>
                      <p className="text-xs text-muted-foreground">{vehicle.driverName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${getStatusColor(vehicle.status)}`} />
                      <Badge variant="secondary" className="text-xs">
                        {vehicle.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Speed</p>
                        <p className="font-mono font-medium">{vehicle.speed} km/h</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Fuel</p>
                        <p className="font-mono font-medium">{vehicle.fuelLevel}%</p>
                      </div>
                    </div>
                    <div className="text-xs">
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-mono text-xs">
                        {vehicle.latitude.toFixed(4)}, {vehicle.longitude.toFixed(4)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Popup>
            </Marker>
          ))}

          {deliveries?.map((delivery) => (
            <Marker
              key={`delivery-${delivery.id}`}
              position={[delivery.deliveryLat, delivery.deliveryLng]}
              icon={deliveryIcon}
            >
              <Popup>
                <Card className="border-0 shadow-none">
                  <CardContent className="p-3 space-y-2">
                    <div>
                      <p className="font-medium text-sm">{delivery.orderId}</p>
                      <p className="text-xs text-muted-foreground">{delivery.customerName}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {delivery.status}
                    </Badge>
                    <div className="text-xs">
                      <p className="text-muted-foreground">Delivery Address</p>
                      <p className="text-xs">{delivery.deliveryAddress}</p>
                    </div>
                  </CardContent>
                </Card>
              </Popup>
            </Marker>
          ))}

          {routes?.map((route) => {
            try {
              const coordinates = JSON.parse(route.pathCoordinates) as [number, number][];
              return (
                <Polyline
                  key={route.id}
                  positions={coordinates}
                  color="#2563eb"
                  weight={3}
                  opacity={0.6}
                />
              );
            } catch {
              return null;
            }
          })}
        </MapContainer>

        <div className="absolute top-4 right-4 z-[1000]">
          <Card className="w-80">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Map Legend</h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-blue-500 rounded-sm" />
                  <span>Vehicles ({vehicles?.length ?? 0})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-green-500 rounded-sm" />
                  <span>Deliveries ({deliveries?.length ?? 0})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-0.5 w-4 bg-blue-500" />
                  <span>Routes ({routes?.length ?? 0})</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
