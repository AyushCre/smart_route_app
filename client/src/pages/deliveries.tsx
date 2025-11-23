import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package, Search, Filter, Plus, MapPin, Clock } from "lucide-react";
import type { Delivery } from "@shared/schema";
import { useState } from "react";

export default function DeliveriesPage() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: deliveries, isLoading } = useQuery<Delivery[]>({
    queryKey: ["/api/deliveries"],
  });

  const handleNewDelivery = () => {
    toast({
      title: "New Delivery",
      description: "Delivery creation form will be available soon.",
      variant: "default",
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "in-transit":
        return "default";
      case "delivered":
        return "default";
      case "delayed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "normal":
        return "secondary";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const filteredDeliveries = deliveries?.filter((delivery) => {
    const matchesStatus = statusFilter === "all" || delivery.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      delivery.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6" data-testid="page-deliveries">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Deliveries</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track all delivery orders
          </p>
        </div>
        <Button data-testid="button-new-delivery" onClick={handleNewDelivery}>
          <Plus className="h-4 w-4 mr-2" />
          New Delivery
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by order ID or customer..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-deliveries"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40" data-testid="select-status-filter">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
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
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>ETA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeliveries && filteredDeliveries.length > 0 ? (
                    filteredDeliveries.map((delivery) => (
                      <TableRow
                        key={delivery.id}
                        className="hover-elevate"
                        data-testid={`delivery-row-${delivery.id}`}
                      >
                        <TableCell className="font-mono font-medium">
                          {delivery.orderId}
                        </TableCell>
                        <TableCell>{delivery.customerName}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          <div className="flex items-start gap-1.5">
                            <MapPin className="h-3.5 w-3.5 mt-0.5 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs">{delivery.pickupAddress}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          <div className="flex items-start gap-1.5">
                            <MapPin className="h-3.5 w-3.5 mt-0.5 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs">{delivery.deliveryAddress}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(delivery.status)}>
                            {delivery.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityVariant(delivery.priority)}>
                            {delivery.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {delivery.scheduledTime
                            ? new Date(delivery.scheduledTime).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {delivery.estimatedDeliveryTime
                            ? new Date(delivery.estimatedDeliveryTime).toLocaleTimeString()
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">No deliveries found</p>
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
