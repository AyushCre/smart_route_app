import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRouteSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import type { Vehicle, Delivery } from "@shared/schema";

interface OptimizeRouteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OptimizeRouteDialog({ open, onOpenChange }: OptimizeRouteDialogProps) {
  const { toast } = useToast();
  
  const { data: vehicles } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: deliveries } = useQuery<Delivery[]>({
    queryKey: ["/api/deliveries"],
  });

  const form = useForm({
    resolver: zodResolver(insertRouteSchema),
    defaultValues: {
      vehicleId: "",
      name: `Route-${Date.now()}`,
      algorithm: "dijkstra",
      waypoints: "[]",
      pathCoordinates: "[]",
      totalDistance: 0,
      estimatedDuration: 0,
      estimatedCost: 0,
      status: "planned",
    },
  });

  const optimizeMutation = useMutation({
    mutationFn: async (data: typeof form.getValues) => {
      return apiRequest("POST", "/api/routes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routes"] });
      toast({
        title: "Success",
        description: "Route optimized successfully!",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to optimize route. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Optimize Route</DialogTitle>
          <DialogDescription>
            Select a vehicle and algorithm to optimize its delivery route.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data: any) => {
            // Convert waypoints and pathCoordinates to JSON if they're objects
            const payload = {
              ...data,
              waypoints: typeof data.waypoints === 'string' ? data.waypoints : JSON.stringify(data.waypoints || []),
              pathCoordinates: typeof data.pathCoordinates === 'string' ? data.pathCoordinates : JSON.stringify(data.pathCoordinates || []),
            };
            optimizeMutation.mutate(payload);
          })} className="space-y-4">
            <FormField
              control={form.control}
              name="vehicleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Vehicle</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a vehicle..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vehicles?.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.vehicleNumber} ({v.driverName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="algorithm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Optimization Algorithm</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="dijkstra">Dijkstra (Shortest Path)</SelectItem>
                      <SelectItem value="astar">A* (Heuristic)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="p-3 bg-muted rounded text-sm text-muted-foreground">
              <p>This will analyze all pending deliveries and create an optimized route for the selected vehicle.</p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={optimizeMutation.isPending}>
                {optimizeMutation.isPending ? "Optimizing..." : "Optimize Route"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
