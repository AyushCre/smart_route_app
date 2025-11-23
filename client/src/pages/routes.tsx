import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Route as RouteIcon, Plus, Zap, Navigation, Clock, DollarSign, TrendingUp } from "lucide-react";
import type { Route } from "@shared/schema";

export default function RoutesPage() {
  const { data: routes, isLoading } = useQuery<Route[]>({
    queryKey: ["/api/routes"],
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "planned":
        return "secondary";
      case "active":
        return "default";
      case "completed":
        return "default";
      default:
        return "secondary";
    }
  };

  const getAlgorithmColor = (algorithm: string) => {
    switch (algorithm) {
      case "dijkstra":
        return "bg-blue-500";
      case "astar":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6" data-testid="page-routes">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Route Optimization</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Optimize delivery routes using advanced algorithms
          </p>
        </div>
        <Button data-testid="button-optimize-route" onClick={() => {
          // Route optimization dialog handler would go here
          window.dispatchEvent(new CustomEvent('openOptimizeDialog'));
        }}>
          <Zap className="h-4 w-4 mr-2" />
          Optimize New Route
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Avg Distance
                </p>
                <h3 className="text-3xl font-bold mt-2">42.5 km</h3>
                <p className="text-xs text-muted-foreground mt-1">Per route</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                <Navigation className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Avg Duration
                </p>
                <h3 className="text-3xl font-bold mt-2">68 min</h3>
                <p className="text-xs text-muted-foreground mt-1">Per route</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Cost Savings
                </p>
                <h3 className="text-3xl font-bold mt-2">23%</h3>
                <p className="text-xs text-muted-foreground mt-1">vs manual routing</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Route Optimization Algorithms</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all" data-testid="tab-all-routes">All Routes</TabsTrigger>
              <TabsTrigger value="dijkstra" data-testid="tab-dijkstra">Dijkstra</TabsTrigger>
              <TabsTrigger value="astar" data-testid="tab-astar">A* Algorithm</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-16 animate-pulse bg-muted rounded" />
                  ))}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Route Name</TableHead>
                        <TableHead>Algorithm</TableHead>
                        <TableHead>Distance</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Waypoints</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {routes && routes.length > 0 ? (
                        routes.map((route) => {
                          let waypointCount = 0;
                          try {
                            waypointCount = JSON.parse(route.waypoints).length;
                          } catch {}

                          return (
                            <TableRow
                              key={route.id}
                              className="hover-elevate"
                              data-testid={`route-row-${route.id}`}
                            >
                              <TableCell className="font-medium">{route.name}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`h-2 w-2 rounded-full ${getAlgorithmColor(
                                      route.algorithm
                                    )}`}
                                  />
                                  <Badge variant="secondary" className="text-xs">
                                    {route.algorithm.toUpperCase()}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell className="font-mono text-sm">
                                {route.totalDistance.toFixed(1)} km
                              </TableCell>
                              <TableCell className="font-mono text-sm">
                                {Math.floor(route.estimatedDuration / 60)} min
                              </TableCell>
                              <TableCell className="font-mono text-sm">
                                ${route.estimatedCost.toFixed(2)}
                              </TableCell>
                              <TableCell className="font-mono text-sm">
                                {waypointCount} stops
                              </TableCell>
                              <TableCell>
                                <Badge variant={getStatusVariant(route.status)}>
                                  {route.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {new Date(route.createdAt).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-12">
                            <RouteIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground">No routes found</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
            <TabsContent value="dijkstra" className="mt-6">
              <div className="text-center py-12 text-muted-foreground">
                <RouteIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Dijkstra algorithm routes will appear here</p>
              </div>
            </TabsContent>
            <TabsContent value="astar" className="mt-6">
              <div className="text-center py-12 text-muted-foreground">
                <RouteIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>A* algorithm routes will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Algorithm Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-md border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <h4 className="font-medium">Dijkstra Algorithm</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Guarantees shortest path. Ideal for static traffic conditions.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <p className="text-xs text-muted-foreground">Avg Distance</p>
                  <p className="text-sm font-mono font-medium">41.2 km</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Time</p>
                  <p className="text-sm font-mono font-medium">65 min</p>
                </div>
              </div>
            </div>

            <div className="rounded-md border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-purple-500" />
                <h4 className="font-medium">A* Algorithm</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Faster computation. Uses heuristics for real-time optimization.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <p className="text-xs text-muted-foreground">Avg Distance</p>
                  <p className="text-sm font-mono font-medium">43.8 km</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Time</p>
                  <p className="text-sm font-mono font-medium">71 min</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
