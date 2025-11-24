import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDeliverySchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface NewDeliveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Indian cities coordinates mapping for auto-detection
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "gaya": { lat: 24.7955, lng: 84.9994 },
  "patna": { lat: 25.5941, lng: 85.1376 },
  "bhubaneswar": { lat: 20.2961, lng: 85.8245 },
  "cuttack": { lat: 20.4625, lng: 85.8830 },
  "rourkela": { lat: 22.2369, lng: 84.8549 },
  "sambalpur": { lat: 21.4521, lng: 84.0032 },
  "bondamunda": { lat: 22.1000, lng: 84.7000 },
  "delhi": { lat: 28.7041, lng: 77.1025 },
  "mumbai": { lat: 19.0760, lng: 72.8777 },
  "bangalore": { lat: 12.9716, lng: 77.5946 },
  "kolkata": { lat: 22.5726, lng: 88.3639 },
  "pune": { lat: 18.5204, lng: 73.8567 },
  "hyderabad": { lat: 17.3850, lng: 78.4867 },
  "ahmedabad": { lat: 23.0225, lng: 72.5714 },
  "jaipur": { lat: 26.9124, lng: 75.7873 },
  "lucknow": { lat: 26.8467, lng: 80.9462 },
  "chandigarh": { lat: 30.7333, lng: 76.7794 },
  "indore": { lat: 22.7196, lng: 75.8577 },
};

export function NewDeliveryDialog({ open, onOpenChange }: NewDeliveryDialogProps) {
  const { toast } = useToast();
  
  // Extract coordinates from city name
  const getCityCoordinates = (address: string): { lat?: number; lng?: number } => {
    if (!address) return {};
    const cityName = address.toLowerCase().trim();
    for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
      if (cityName.includes(city)) {
        return coords;
      }
    }
    return {};
  };
  
  // Generate unique order ID with timestamp + random number
  const generateUniqueId = (prefix: string) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `${prefix}-${timestamp}-${random}`;
  };
  
  const form = useForm({
    resolver: zodResolver(insertDeliverySchema),
    defaultValues: {
      orderId: generateUniqueId("ORD"),
      customerName: "",
      customerId: generateUniqueId("CUST"),
      pickupAddress: "",
      pickupLat: 22.2369, // Rourkela, Odisha
      pickupLng: 84.8549,
      deliveryAddress: "",
      deliveryLat: 20.2, // Bhubaneswar, Odisha
      deliveryLng: 85.8,
      status: "pending",
      priority: "normal",
    },
  });

  // Regenerate IDs every time dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        orderId: generateUniqueId("ORD"),
        customerName: "",
        customerId: generateUniqueId("CUST"),
        pickupAddress: "",
        pickupLat: 22.2369,
        pickupLng: 84.8549,
        deliveryAddress: "",
        deliveryLat: 20.2,
        deliveryLng: 85.8,
        status: "pending",
        priority: "normal",
      });
    }
  }, [open, form]);

  const addDeliveryMutation = useMutation({
    mutationFn: async (data: any) => {
      const cleanData = {
        ...data,
        pickupLat: parseFloat(data.pickupLat),
        pickupLng: parseFloat(data.pickupLng),
        deliveryLat: parseFloat(data.deliveryLat),
        deliveryLng: parseFloat(data.deliveryLng),
      };
      return apiRequest("POST", "/api/deliveries", cleanData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deliveries"] });
      toast({
        title: "Success",
        description: "Delivery created successfully!",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      console.error("Delivery creation error:", error);
      const errorMsg = error?.response?.data?.details 
        ? JSON.stringify(error.response.data.details)
        : error?.response?.data?.error
        ? error.response.data.error
        : error.message || "Failed to create delivery. Please try again.";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Delivery</DialogTitle>
          <DialogDescription>
            Enter the delivery details to schedule a new order.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data: any) => addDeliveryMutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="orderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order ID</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., ORD-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Jane Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pickupAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pickup Address (e.g., "Gaya", "Patna", "Rourkela")</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Gaya, Patna, Rourkela..." 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        const coords = getCityCoordinates(e.target.value);
                        if (coords.lat !== undefined && coords.lng !== undefined) {
                          form.setValue("pickupLat", coords.lat);
                          form.setValue("pickupLng", coords.lng);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deliveryAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Address (e.g., "Gaya", "Patna", "Bhubaneswar")</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Gaya, Patna, Bhubaneswar..." 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        const coords = getCityCoordinates(e.target.value);
                        if (coords.lat !== undefined && coords.lng !== undefined) {
                          form.setValue("deliveryLat", coords.lat);
                          form.setValue("deliveryLng", coords.lng);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="p-3 bg-muted rounded text-sm text-muted-foreground">
              <p>GPS coordinates are automatically assigned based on the address. Latitude/Longitude help pinpoint exact locations for map display and route optimization.</p>
            </div>

            <FormField
              control={form.control}
              name="pickupLat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pickup Latitude</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.0001" placeholder="22.2369 (Rourkela)" {...field} value={field.value || ""} onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : "")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pickupLng"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pickup Longitude</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.0001" placeholder="84.8549 (Rourkela)" {...field} value={field.value || ""} onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : "")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deliveryLat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Latitude</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.0001" placeholder="20.2 (Bhubaneswar)" {...field} value={field.value || ""} onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : "")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deliveryLng"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Longitude</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.0001" placeholder="85.8 (Bhubaneswar)" {...field} value={field.value || ""} onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : "")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addDeliveryMutation.isPending}>
                {addDeliveryMutation.isPending ? "Creating..." : "Create Delivery"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
