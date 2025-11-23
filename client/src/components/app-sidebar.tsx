import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  MapPin,
  Truck,
  Package,
  Route,
  BarChart3,
  Bell,
  Radio,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const mainNavItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Live Map", url: "/map", icon: MapPin },
  { title: "Vehicles", url: "/vehicles", icon: Truck },
  { title: "Deliveries", url: "/deliveries", icon: Package },
  { title: "Routes", url: "/routes", icon: Route },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Alerts", url: "/alerts", icon: Bell },
  { title: "IoT Sensors", url: "/iot", icon: Radio },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
            <Truck className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Smart Delivery</h2>
            <p className="text-xs text-muted-foreground">Route Optimization</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url} data-testid={`nav-${item.url.slice(1) || 'dashboard'}`}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 rounded-md border bg-card p-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
              AD
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">Admin User</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs px-2 py-0">
                Admin
              </Badge>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
