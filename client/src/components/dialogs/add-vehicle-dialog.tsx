import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVehicleSchema } from "@shared/schema";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface AddVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddVehicleDialog({ open, onOpenChange }: AddVehicleDialogProps) {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(insertVehicleSchema),
    defaultValues: {
      vehicleNumber: "",
      driverName: "",
      status: "idle",
      latitude: 22.2369, // Rourkela, Odisha
      longitude: 84.8549, // Rourkela, Odisha
      speed: 0,
      fuelLevel: 100,
      routeCompletion: 0,
    },
  });

  const addVehicleMutation = useMutation({
    mutationFn: async (data: typeof form.getValues) => {
      return apiRequest("POST", "/api/vehicles", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      toast({
        title: "Success",
        description: "Vehicle added successfully!",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add vehicle. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Vehicle</DialogTitle>
          <DialogDescription>
            Enter the vehicle details to add it to your fleet.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data: any) => addVehicleMutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="vehicleNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., VH-1001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="driverName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Driver Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fuelLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fuel Level (%)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" max="100" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addVehicleMutation.isPending}>
                {addVehicleMutation.isPending ? "Adding..." : "Add Vehicle"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
